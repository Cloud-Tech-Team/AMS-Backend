const express = require('express')
const router = express.Router()
const upload = require('./../handler/multer')//form data
const jwt = require('jsonwebtoken')


const Branch = require('../models/Branches')
 
const Constants= require('./../constants/constant')

router.post('/add',upload,function(req,res){
    
    if(req.headers.authorization){ 
        const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		console.log("role:"+decoded.role);
		if(decoded.role=='admin'){
            console.log(req.body);
            const branch=req.body.branch;
            Branch.find({branch},function(err,result){
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
                    const new_branch= new Branch({
                        branch:branch,
                        totalSeats:req.body.totalSeats,
                        NRISeats:req.body.NRISeats,
                        MSeats:req.body.MSeats,
                        GSeats:req.body.GSeats,
                    })
                    new_branch.save(function(err){
                        if(err){
                            console.log("Error in saving branch")
                            res.status(500)
                            res.json({
                                status: "FAILED",
                                message: "An error occured while checking for existance of user"
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

});

router.patch('/edit/:branch',upload,function(req,res){
    if(req.headers.authorization){
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		console.log("role:"+decoded.role);
		if(decoded.role=='admin'){
			_branch=req.params.branch;
            ////
			Branch.find({branch:_branch},function(err,result){
				if(err){
					res.status(500);	// Internal server error
					console.log('error message:\n' + err.message);
					res.json({
						status: "FAILED",
						message: "Internal server error"
					});
				}
                
				else{
                    Branch.updateOne({branch:_branch},{ $set: req.body}, { runValidators: true },function(err){
                        if (err) {
                            res.json({ 
                                message: err.message,
                                status: "FAILED" 
                            });
                        } 
                        res.status(200);
                        res.json({
                        status:"SUCCESS",
                        message:"fields "+_branch+" quota is updated",
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


router.get('/names',function(req,res){
    branchList=[]
    Branch.find({},{branch:1},function(err,b){
     
        b.forEach(function(item){
            branchList.push(item.branch)

        })
        res.status(200)
        res.json({
            status:"SUCCESS",
            message:branchList
        })
    })
})

router.get('/waitingList/:quota/:branch',function(req,res){
    
    if(req.headers.authorization){
        const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		console.log("role:"+decoded.role);
        if(decoded.role=='admin'){
            _branch=req.params.branch;
            _quota=req.params.quota;
            if(_quota in Constants.quotas){
                Branch.findOne({branch:_branch},function(err,branch){
                    if(branch){
                        if(_quota=='NRI')
                            waitingList=branch.filledNRI?branch.waitingListNRI:0;
                        else{
                            waitingList=-1
                        }
                        res.status(200)
                        res.json({
                            status:"SUCCESS",
                            message:"Branch "+_branch,
                            waitingList:waitingList
                        })
                    }
                    else{
                        res.json({
                            status:"FAILED",
                            message:"Branch "+_branch+ " NOT available"
                        }) 
                    }
                });
            }
            else{
                res.json({
                    status:"FAILED",
                    message:"Quota "+_quota+ " NOT available"
                })
            }
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
    
});

module.exports = router