const express = require('express')
const router = express.Router()
const upload = require('../handler/multer')
const jwt = require('jsonwebtoken')


const AdminDB = require('../models/Admin')
const User = require('../models/User')
const verifyToken = require('../middleware/verifyToken');

async function addcount(query, counts) {
	await User.countDocuments(query).then(function (count, err) {
		if (err) {
			console.error(`error: ${err.message}`)
			counts.push(undefined)
		} else {
			console.log(`returning ${count}`)
			counts.push(count)
		}
	})
}

router.get('/count', upload, async function (req, res) {
	/* Verify token belongs to an admin */
	console.log(req.headers)
	console.log(req.body)
	if ((typeof(req.headers.authorization) == 'undefined') || (req.headers.authorization == null)) {
		console.log('req.headers.authorization undefined')
		res.status(400);
		return res.json({
			status: 'FAILED',
			message: 'Token not specified'
		})
	}
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
	// queries = req.body.queries
	var queries = [
		{"quota":"Government"}, {"quota":"Management"}, {"quota":"NRI"}, {"verified":false}, {"verified":true}
	]
	console.log(queries)
	if (typeof(queries) == 'undefined' || typeof(queries.length) == 'undefined') {
		console.log(queries)
		res.status(404)
		return res.json({
			status: "FAILED",
			message: "'queries' field must be defined as an array"
		})
	}
	console.log('queries\n========')
	console.log(queries)

	var nqueries = queries.length
	var counts = []
	for (const query of queries)
		await addcount(query, counts)
	console.log(`counts = ${counts}`)
	res.status(200)
	res.json({
		status: "SUCCESS",
		result: counts
	})
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

/*
 * /admin/search:
 *	Search user database with given filter, and return results.
 *	Return @count results starting from @offset of the data returned by the query.
 *	The filter for query is req.body minus @count and @offset parameters.
 */
router.get('/search', upload, function(req,res){
	if(typeof(req.headers.authorization) != 'undefined' && req.headers.authorization){
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		console.log("role:"+decoded.role);
		console.log(req.body)
		if(decoded.role=='admin'){
			const count = req.body.count 		// no: of results to return
			const offset = req.body.offset || 0	// offset from which to return count results
			console.log(`count = ${count}\toffset = ${offset}`)
			if (typeof(count) != 'undefined' && count <= 0) {
				res.status(400)
				return res.json({
					status: 'FAILURE',
					message: 'invalid count: negative value'
				})
			}
			if (offset < 0) {
				res.status(400)
				return res.json({
					status: 'FAILURE',
					message: 'invalid offset: negative value'
				})
			}

			// create filter by removing count and offset fields from req.body
			var filter = req.body
			delete filter.count
			delete filter.offset
			User.find(filter, function(err, data){
				if(err){
					res.status(500);	// Internal server error
					console.log('error message:\n' + err.message);
					return res.json({
						status: "FAILED",
						message: "Internal server error"
					});
				}
				else{
					console.log(`data.length = ${data.length}`)
					if (offset >= data.length) {
						res.status(400);
						return res.json({
							status: 'FAILURE',
							message: `offset ${offset} is past end of result`
						})
					}
					var result
					if (typeof(count) != 'undefined')
						result = data.slice(offset, offset+count)
					else
						result = data.slice(offset)
					res.status(200);
					res.json({
					status:"SUCCESS",
					message: 'Result retrieved successfully',
					count: result.length,
					list: result
					})
				}
			})
		} else {
			res.status(403);
			return res.json({
				status:"FAILED",
				message:'Access denied'
			})
		}
		
	}
	else{
		return res.json({
			status:"FAILED",
			message:'Access token error'
		})
	}
	
})	

/* create co-admins */
router.post('/add_coadmin', upload, function (req, res) {
	console.log('/add_coadmin')
	console.log('verifying admin token')

	if ((typeof(req.headers.authorization) == 'undefined') || (req.headers.authorization == null)) {
		console.log('req.headers.authorization undefined')
		res.status(400);
		return res.json({
			status: 'FAILED',
			message: 'Token not specified'
		})
	}
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
			name: req.body.name,
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

router.patch('/disable_coadmin',upload, async function (req, res) {
	console.log(req.headers)
	console.log(req.body)
	if(req.headers.authorization){
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		console.log("role:"+decoded.role);
		if(decoded.role=='admin'){
			var _email=req.body.email;
			console.log("email "+_email)
            ////
			AdminDB.find({email:_email},function(err,result){
				if(err){
					res.status(500);	// Internal server error
					console.log('error message:\n' + err.message);
					res.json({
						status: "FAILED",
						message: "Internal server error"
					});
				}
                
				else{
					console.log(result[0].disabled);
                    AdminDB.updateOne({email:_email},{$set: {disabled: !result[0].disabled} }, { runValidators: true },function(err){
                        if (err) {
                            res.json({ 
                                message: err.message,
                                status: "FAILED"
                            });
                        } 
                        res.status(200);
                        res.json({
                        status:"SUCCESS",
                        message:"fields disabled is updated",
                        }) 
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


/* this is just for testing
router.get('/nextcoadmin', upload, async function (req, res) {
	console.log('/nextcoadmin')
	const coadmin = await AdminDB.getNextCoadmin()
	console.log(`found next co-admin ${coadmin}`)
	res.json(coadmin)
})
*/

module.exports = router;
