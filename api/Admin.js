const express = require('express')
const router = express.Router()
const upload = require('../handler/multer')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

router.get('/count', upload, function (req, res) {
	console.log('/count\n=======\n');
	console.log(req.body);

	if (req.body.token) {
		token = req.body.token;
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		console.log('email: ' + decoded.email + ' role: ' + decoded.role);
		if (decoded.role != 'admin') {
			console.log('User is not admin!');
			res.status(403);	// Forbidden
			res.json({
				status: "FAILED",
				message: "Access denied"
			});
		} else {
			delete req.body.token;
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
		}
	}
})
module.exports = router
