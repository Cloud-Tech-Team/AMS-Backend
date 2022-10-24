const express = require('express')
const router = express.Router()
const upload = require('../handler/multer')
const jwt = require('jsonwebtoken')


const AdminDB = require('../models/Admin')
const User = require('../models/User')
const verifyToken = require('../middleware/verifyToken');

router.get('/count', upload, function (req, res) {
	/* Verify token belongs to an admin */
	const token = req.headers.authorization.split(" ")[1];
	var decoded
	try {
		console.log(`token = ${token}`)
		decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
	} catch (ex) {
		console.log(ex.message)
		res.status(400)
		res.json({
			status: 'FAILED',
			message: 'Invalid token'
		})
		return
	}
	if (decoded.role != 'admin' && decoded.role != 'co-admin') {
		console.log('User is not admin!');
		console.log('email: ' + decoded.email);
		res.status(403);	// forbidden
		res.json({
			status: "FAILED",
			message: "Access denied"
		});
		return
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
    let { email, password } = req.body

    if (password == "") {
		res.status(204);
        res.json({
            status: "FAILED",
            message: "Empty password entered"
        })
    } else {
		AdminDB.findOne({ email: email}).then(user => {
            if (user) {
				console.log('entered password: ' + password)
				console.log(`email ${email} exists`)
				console.log(user)
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
					console.log(`incorrect password ${password}`)
                    // Incorrect password
					res.status(400);
                    res.json({
                        status: "FAILED",
                        message: "Invalid email or password"
                    })
                }
            } else {
				res.status(400);
                res.json({
                    status: "FAILED",
                    message: "Invalid email or password"
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
//quota:NRI,Management,Government
router.get('/quota/:quota',upload, function(req,res){
	if(req.headers.authorization){
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		console.log("role:"+decoded.role);
		if(decoded.role=='admin'){
			_quota=req.params.quota;
			User.find({quota:_quota},function(err,result){
				if(err){
					res.status(500);	// Internal server error
					console.log('error message:\n' + err.message);
					res.json({
						status: "FAILED",
						message: "Internal server error"
					});
				}
				else{
					res.status(200);
					res.json({
					status:"SUCCESS",
					message:"list of "+_quota+" quota is retrived",
					count:result.length,
					list:result
					})

				}
			})
			
		}
		else{
			res.status(403);
			res.json({
				status:"FAILED",
				message:'Access denied'
			})
		}
		
	}
	else{
		res.json({
			status:"FAILED",
			message:'Access token error'
		})
	}
	
})	

/* create co-admins */
router.post('/add_coadmin', upload, function (req, res) {
	console.log('/add_coadmin')
	console.log('verifying admin token')
	const token = req.headers.authorization.split(" ")[1];
	var decoded
	try {
		console.log(`token = ${token}`)
		decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
	} catch (ex) {
		console.log(ex.message)
		res.status(400)
		return res.json({
			status: 'FAILED',
			message: 'Invalid token'
		})
	}

	if (decoded.role != 'admin') {
		console.log('User is not admin!');
		console.log('email: ' + decoded.email + ' role: ' + decoded.role);
		res.status(403);	// forbidden
		return res.json({
			status: "FAILED",
			message: "Access denied"
		});
	}

	AdminDB.find({email: req.body.email}, (err, result) => {
		if (result.length == 1) {
			console.log(`co-admin with email ${req.body.email} exists`)
			res.status(409)
			return res.json({
				status: 'FAILED',
				message: 'co-admin with email already exists'
			})
		}
		// else
		console.log('creating new co-admin')
		const admin = new AdminDB({
			firstName: req.body.firstName,
			middleName: req.body.middleName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: req.body.password
		})
		admin.save((err) => {
			if (err) {
				console.log('error saving co-admin')
				res.status(500)
				res.json({
					status: 'FAILED',
					message: 'Internal server error'
				})
			} else {
				console.log('saved co-admin successfully')
				res.status(200)
				res.json({
					status: 'SUCCESS',
					message: 'Added co-admin successfully'
				})
			}
		})
	})
})

module.exports = router;
