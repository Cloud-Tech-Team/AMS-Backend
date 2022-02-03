const express = require('express')
const router = express.Router()
const upload = require('./../handler/multer')//form data

const Branch = require('../models/Branches')

router.post('/add',upload,function(req,res){
    console.log(req.body);
    const branch=req.body.branch;
    Branch.find({branch},function(err,result){
        if(result.length>=1)
        {
            res.json({
                message:"Already Existing Branch",
                status:"FAILED"
            });
        }
        else{
            const new_branch= new Branch({
                branch:branch,
                totalSeats:req.body.totalSeats
            })
            new_branch.save(function(err){
                if(err){
                    console.log("Error in saving branch")
                    res.json({
                        status: "FAILED",
                        message: "An error occured while checking for existance of user"
                    })

                }
                else{
                    res.json({
                        message:"Branch save successfully",
                        status:"SUCCESS"
                    })
                }
            })
        }
    })
});

router.get('/waitingList/:branch',function(req,res){
    _branch=req.params.branch;

    Branch.findOne({branch:_branch},function(err,branch){
        if(branch){
            const waitingList=branch.filled?branch.waitingList:0;
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
});

module.exports = router