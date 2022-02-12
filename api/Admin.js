const express = require('express')
const router = express.Router()
const upload = require('../handler/multer')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const verifyToken = require('../middleware/verifyToken');

router.get('/count', verifyToken, upload, function (req, res) {
	/* Verify token belongs to an admin */
	const token = req.headers.authorization.split(" ")[1];
	const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
	if (decoded.role != 'admin') {
		console.log('User is not admin!');
		console.log('email: ' + decoded.email);
		res.status(403);	// forbidden
		res.json({
			status: "FAILED",
			message: "Access denied"
		});
	}
	console.log('/count\n=======\n');
	console.log(req.body);
	/* Perform query on db with the request body */
	User.find(req.body, function (err, result) {
		if (err) {
			res.status(500);	// Internal server error
			console.log('error message:\n' + err.message);
			res.json({
				status: "FAILED",
				message: "Internal server error"
			});
		} else {
			res.status(200);
			res.json({
				status: "SUCCESS",
				count: result.length
			});
		}
	});
})

router.post('/login', upload, function (req, res) {
	console.log('/admin/login');
	console.log(req.body);
    let { password } = req.body

    if (password == "") {
		res.status(204);
        res.json({
            status: "FAILED",
            message: "Empty password entered"
        })
    } else {
		User.findOne({ applicationNo: 'admin' }).then(user => {
            if (user) {
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
                        role: user.role
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
            } else {
				res.status(400);
                res.json({
                    status: "FAILED",
                    message: "Admin account disabled"
                })
            }
        }).catch(err => {
            console.log(req.body)
            console.log(err.message)
			res.status(500);
            res.json({
				status: "FAILED",
                message: "Internal server error"
            })
        })
    }
})

module.exports = router
