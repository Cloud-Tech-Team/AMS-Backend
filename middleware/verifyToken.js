const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	if (typeof(req.headers.authorization) == 'undefined') {
		console.log('no token received')
		res.status(403)
		return res.json({
			status: 'FAILED',
			message: 'Token not specified'
		})
	}
	const token = req.headers.authorization.split(" ")[1];
	try {
		console.log(`token = ${token}`)
		decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
		console.log('verified')
		console.log(decoded)
		req.tokenData = decoded
		next()
	} catch (ex) {
		console.log(`error verifying token ${ex.message}`)
		res.status(403)
		return res.json({
			status: 'FAILED',
			message: 'Invalid token'
		})
	}
};
