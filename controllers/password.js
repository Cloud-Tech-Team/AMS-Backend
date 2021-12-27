const User = require('../models/User');
const bcrypt = require('bcrypt');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Query db for email, and send password reset link
exports.recover = (req, res) => {
	User.findOne({email: req.body.email})
		.then(user => {
			if (!user){
				return res.status(401).json({message: 'Invalid email address: ' + req.body.email});
			}

			// Generate and set password reset token
			user.generatePasswordReset();
			console.log('generated new password reset token')

			// Save the updated user
			user.save().then(user => {
				let link = 'http://' + req.headers.host + '/user/reset/' + user.resetPasswordToken;
				const mailOptions = {
					to: user.email,
					from: process.env.FROM_EMAIL,
					subject: 'Password reset request',
					text: `Hi ${user.firstName}\n
							Please click on the following link ${link} to reset your password.\n\n
							If you did not request this, please ignore this email and your password
							will remain unchanged.\n`
				};

				sgMail.send(mailOptions, (error, result) => {
					if (error)
						return res.status(500).json({message: error.message});
					console.log('sent password reset mail');
					res.status(200).json({message: 'A password reset mail has been sent to ' + user.email});
				});
			}).catch(err => res.status(500).json({message: err.message}));
		}).catch(err => res.status(500).json({message: err.message}));
}

// Find matching resetPasswordToken whose resetPasswordExpires is stil valid ( > Date.now())
exports.reset = (req, res) => {
	User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
		.then((user) => {
			if (!user) {
				return res.status(401).json({message: 'Password reset token is invalid'});
			}
			// Redirect user to form with the email address
			res.render('reset', {user});
		}).catch(err => res.status(500).json({message: err.message}));
}

/*
 * Find matching resetPasswordToken whose resetPasswordExpires is stil valid ( > Date.now())
 * If valid set the new password and send a mail informing the user of the change
 */
exports.resetPassword = (req, res) => {
	User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
		.then((user) => {
			console.log('token: ' + req.params.token);
			if (!user) {
				return res.status(401).json({message: 'Password reset token is invalid'});
			}

			// Check if both password fields match (confirm password)
			if (req.body.password != req.body.confirmPassword)
				return res.status(401).json({message: 'Password fields do not match'});

			// Set the new password
			console.log('new password: ' + req.body.password);
			bcrypt.hash(req.body.password, 10).then(hashedPassword => {

				user.password = hashedPassword;
				console.log('new password hash: ' + user.password);
				user.resetPasswordToken = undefined;
				user.resetPasswordExpires = undefined;

				// Save to db
				user.save((err) => {
					if (err)
						return res.status(500).json({message: err.message});
					// send mail
					const mailOptions = {
						to: user.email,
						from: process.env.FROM_EMAIL,
						subject: 'Your password has been changed',
						text: `Hi ${user.username}\n
					The password for your account ${user.email} has been changed\n`
					};

					sgMail.send(mailOptions, (error, result) => {
						if (error)
							return res.status(500).json({message: error.message});

						res.status(200).json({message: 'Your password has been updated'});
					});
				});
			}).catch(err => {
				res.json({
					status: 'FAILED',
					message: 'An error occurred while hashing the password'
				})
			});
		});
}