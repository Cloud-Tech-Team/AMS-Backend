const User = require('../models/User');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Query db for email, and send password reset link
exports.recover = (req, res, upload) => {
	User.findOne({applicationNo: req.body.applicationNo}).then(user => {
		if (!user) {
			return res.status(400).json({message: 'Invalid applicationNo: ' + req.body.applicationNo});
		}

		const mailOptions = {
			to: user.email,
			from: process.env.FROM_EMAIL,
			subject: 'Password reset request',
			text: `Hi ${user.firstName}\n
				Your password for application number ${user.applicationNo} is ${user.password}\n\n`
		};

		sgMail.send(mailOptions, (error, result) => {
			if (error) {
				res.status(500).json({message: error.message}); // probably should not send actual error
				return;
			}
			console.log('sent password mail');
			res.status(200).json({message: 'The password has been mailed to ' + user.email});
		});
	}).catch(err => {
		console.log('An error occurred while searching for the user');
		res.status(500).json({message: err.message})
	});
}
