const express = require('express')
const router = express.Router()
const upload = require('./../handler/multer')//form data
const jwt = require('jsonwebtoken')


const Branch = require('../models/Branches')
 
const Constants= require('./../constants/constant')

router.post('/add', verifyToken, upload,function(req,res){
	const decoded = req.tokenData
	if(decoded.role=='admin'){
		console.log(req.body);
		const branch = req.body.branch;
		const year = req.body.year;
		/* check if branch exists */
		Branch.find({branch: branch, year: year},function(err,result){
			if(err){
				console.log("Error in finding branch")
				res.status(500)
				res.json({
					status: "FAILED",
					message: "Insernal server error"
				})
			}
			if(result.length>=1)
			{
				console.log("Already existing")
				res.json({
					message:"Already Existing Branch",
					status:"FAILED"
				});
			}
			else{
				/* what to do when we add more quotas? */
				var nriSeats = req.body.NRISeats
				var mgmtSeats = req.body.MgmtSeats
				var superSeats = req.body.SuperSeats
				nriSeats = nriSeats ? nriSeats : 0
				mgmtSeats = mgmtSeats ? mgmtSeats : 0
				superSeats = superSeats ? superSeats : 0
				var totalSeats = nriSeats + mgmtSeats + superSeats

				const new_branch = new Branch({
					branch:branch,
					year: year,
					totalSeats: totalSeats,
					NRISeats: nriSeats,
					MgmtSeats: mgmtSeats,
					SuperSeats: superSeats,
					WLNRILimit: req.body.WLNRILimit,
					WLMgmtLimit: req.body.WLMgmtLimit,
					WLSuperLimit: req.body.WLSuperLimit
				})
				console.log('new branch')
				console.log(new_branch)
				new_branch.save(function(err){
					if(err){
						console.log("Error in saving branch")
						res.status(500)
						res.json({
							status: "FAILED",
							message: err.message
						})

					}
					else{
						res.status(200)
						res.json({
							message:"Branch added successfully",
							status:"SUCCESS"
						})
					}
				})
			}
		})
	}
});

/*
 * /branch/getall - list all fields of current branches
 * Only admin
 */
router.post('/getall', verifyToken, upload, function (req, res) {
	const decoded = req.tokenData
	console.log(`role = ${decoded.role}`)
	if (decoded.role != 'admin') {
		console.log('not admin')
		res.status(403)
		return res.json({
			status: 'FAILED',
			message: 'Access denied'
		})
	}
	Branch.find(req.body, (err, result) => {
		if (err) {
			console.log(`error: ${err.message}`)
			res.status(500)
			return res.json({
				status: 'FAILED',
				message: err.message
			})
		}
		res.status(200)
		res.json({
			status: 'SUCCESS',
			list: result
		})
	})
})

/*
 * /branch/get - list all fields of current branches
 */
router.post('/get', verifyToken, upload, function (req, res) {
	const decoded = req.tokenData
	Branch.find(req.body, (err, result) => {
		if (err) {
			console.log(`error: ${err.message}`)
			res.status(500)
			return res.json({
				status: 'FAILED',
				message: err.message
			})
		}
		res.status(200)
		res.json({
			status: 'SUCCESS',
			list: result.map(o => ({
				name: o.branch,
				year: o.year,
				totalSeats: o.totalSeats,
				NRISeats: o.NRISeats,
				MgmtSeats: o.MgmtSeats,
				SuperSeats: o.SuperSeats,
				NRIOccupied: o.occupiedSeatsNRI,
				MgmtOccupied: o.occupiedSeatsMgmt,
				SuperOccupied: o.occupiedSeatsSuper,
				MgmtWL: o.waitingListMgmt.length
				// TODO: Add waiting limit field
			}))
		})
	})
})
/*
 * /branch/delete - delete a branch from branch database
 * 	Branch to be deleted is given in request body which is passed directly to the
 * 	Branch.delete method
 */
router.delete('/delete', verifyToken, upload, function (req, res) {
	console.log(`headers\n${req.headers}`)
	const decoded = req.tokenData
	if (decoded.role != 'admin') {
		console.log('not admin')
		res.status(403)
		return res.json({
			status: 'FAILED',
			message: 'Access denied'
		})
	}

	console.log(req.body)
	if (Object.keys(req.body).length == 0) {
		console.log('empty body')
		res.status(400)
		return res.json({
			status: 'FAILED',
			message: 'Empty request body'
		})
	}

	Branch.deleteOne(req.body, (err, result) => {
		if (err) {
			console.log(`error deleting branch: ${err.message}`)
			res.status(500)
			return res.json({
				status: 'FAILED',
				message: err.message
			})
		}
		console.log('branch deleted successfully')
		res.status(200)
		return res.json({
			status: 'SUCCESS',
			message: 'Branch deleted successfully'
		})
	})
})

/*
 * Edit branch db document given branch name and year
 */
router.patch('/edit/:branch/:year', verifyToken, upload, async function(req,res){
	const decoded = req.tokenData
	console.log("role:"+decoded.role);
	if(decoded.role=='admin'){
		branch=req.params.branch;
		year = req.params.year;
		console.log(req.params)
		////
		console.log(`updating branch=${branch}, year=${year}`)
		console.log(req.body)
		await Branch.findOneAndUpdate({branch: branch, year: year}, { $set: req.body},
			{ runValidators: true }, function(err, result) {
				if(err){
					res.status(500);	// Internal server error
					console.log('error message:\n' + err.message);
					return res.json({
						status: "FAILED",
						message: "Internal server error"
					});
				}
				console.log(result)
				if (result ==null) {
					console.log('modified 0')
					res.status(400)
					return res.json({
						status: 'FAILED',
						message: 'no document matched query'
					})
				} else {
					console.log(`modified ${result.n}`)
					res.json({
						status:"SUCCESS",
						message:"fields "+branch+" quota is updated",
					}) 
				}
			})
	}
})

module.exports = router
