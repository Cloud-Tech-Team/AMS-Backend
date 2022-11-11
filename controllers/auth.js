const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res) => {
    let { firstName, email, password } = req.body
    console.log(req.body)
    // first_name = first_name;
    // email = email;

    if (firstName == "" || email == "" || password == "") {
		res.status(204);	// 204 No Content
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
    } else if (password.length < 8) {
		res.status(204);
        res.json({
            status: "FAILED",
            message: "Password is too short"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
		res.status(400);
        res.json({
            status: "FAILED",
            message: "Invalid email"
        })
    } else {
        // Check if user already exists
        User.find({ email }).then(result => {
            if (result.length) {
                // A user already exists
				res.status(409);	// 409 Conflict
                res.json({
                    status: "FAILED",
                    message: "User with given email already exists"
                })
            } else {
                bcrypt.hash(password, 10).then(hashedPassword => {
                    const newUser = new User({
                        firstName,
                        email,
                        password: hashedPassword,

                    })

                    newUser.save().then(result => {
						res.status(200);
                        res.json({
                            status: "SUCCESS",
                            message: "Signup Successful",
                        })
                    }).catch(err => {
						res.status(500);
                        res.json({
                            status: "FAILED",
                            message: "An error occured while adding the user"
                        })
                    })
                }).catch(err => {
					res.status(500);
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing the password"
                    })
                })
            }
        }).catch(err => {
            console.log(err)
			res.status(500);
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existance of user"
            })
        })
    }
};

exports.login = async (req, res) => {
    let { applicationNo, password } = req.body
	if (typeof(applicationNo) != 'string' || typeof(password) != 'string') {
		console.log('invalid request body')
		console.log(`applicationNo = ${applicationNo}, password = ${password}`)
		res.status(400)
		return res.json({
			status: 'FAILED',
			message: 'Request body missing fields'
		})
	}

	console.log(req.body);
    applicationNo = applicationNo.trim();
    console.log(req.body)
    if (applicationNo == "" || password == "") {
		res.status(204);
        res.json({
            status: "FAILED",
            message: "Empty credentials entered"
        })
    } else {
        User.findOne({ applicationNo }).then(user => {
            if (user) {
				if (user.role != 'student') {
					console.log('user.role = ' + user.role);
					res.status(400);
					return res.json({
						status: "FAILED",
						message: "Incorrect password or application number"
					});
				}
                console.log('user\n=====\n' + user.applicationNo)
				console.log('password: ' + password);
                if (user.comparePassword(password)) {
                    // Correct password
                    console.log('correct password');
                    const token = user.generateJWT();

					res.status(200);
                    res.json({
                        status: "SUCCESS",
                        message: "Sign-in successful",
                        token: token,
                    })
                } else {
					console.log(password);
                    // Incorrect password
					res.status(400);
                    res.json({
                        status: "FAILED",
                        message: "Incorrect password"
                    })
                }
            } else {	// invalid email
				res.status(400);
                res.json({
                    status: "FAILED",
                    message: "Incorrect password or application number"
                })
            }
        }).catch(err => {
			console.log('could not find user ' + applicationNo)
            console.log(req.body)
            console.log(err.message)
			res.status(500);
            res.json({
				status: "FAILED",
                message: "An error occured while checking for existance of user"
            })
        })
    }
};
