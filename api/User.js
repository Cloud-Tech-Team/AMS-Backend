const express = require('express')
const router = express.Router()
const cloudinary=require('cloudinary')
// const Datauri= require('datauri')
const path=require('path')



const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();

const formatBufferTo64 = file =>
  parser.format(path.extname(file.originalname).toString(), file.buffer)

const cloudinaryUpload = file => cloudinary.uploader.upload(file);

// const multer =require('multer'); // form-data multipart
// const storage=multer.diskStorage({
//     destination:function(req,res,cb){
//         cb(null,"uploads");
//     },
//     filename:function(req,file,cb){
//         cb(
//             null,
//             file.fieldname + "-" +Date.now() + path.extname(file.originalname)
//         )
//     }
// })
// const upload = multer({storage:storage});

require('./../config/cloudinary')
const upload=require('./../handler/multer')

// const datauri=require('./../handler/datauri')

// mongodb user model
const User = require('./../models/User')

const bcrypt = require('bcrypt')


router.post('/signup',upload, (req, res) => {
    let {firstName, email, password } = req.body
    console.log(req.body)
    // first_name = first_name;
    // email = email;

    if (firstName == "" || email == "" || password == "" ) {
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password is too short"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email"
        })
    } else {
        // Check if user already exists
        User.find({ email }).then(result => {
            if (result.length) {
                // A user already exists
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
                        res.json({
                            status: "SUCCESS",
                            message: "Signup Successful",
                        })
                    }).catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while adding the user"
                        })
                    })
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing the password"
                    })
                })
            }
        }).catch(err => {
            console.log(err)
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existance of user"
            })
        })
    }
});

router.post('/signin',upload, (req, res) => {
    let { email, password } = req.body
    email = email.trim();
    console.log(req.body)

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials entered"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email"
        })
    } else {
        User.find({ email }).then(data => {
            console.log(data)
            if (data.length) {
                const hashedPassword = data[0].password
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        // Password matched
                        res.json({
                            status: "SUCCESS",
                            message: "Sign-in successful"
                        })
                    } else {
                        // Incorrect password
                        res.json({
                            status: "FAILED",
                            message: "Incorrect password or mail"
                        })
                    }
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while checking the password"
                    })
                })
            } else {    // email not found
                res.json({
                    status: "FAILED",
                    message: "Incorrect password or mail"
                })
            }
        }).catch(err => {
            console.log(req.body)
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existance of user"
            })
        })
    }
});


router.get('/register',upload,function(req,res){
    User.find(function(err,users){
          if(!err) {

            res.send(users);
         }else{
           res.send(err);
         }

    });
});
router.get('/register/:id',upload,function(req,res){
     User.findOne({_id:req.params.id},function(err,users){
          if(!err) {

            res.send(users);
         }else{
            // console.log("ahaa kollaalo");
           res.send(err);
         }

    });
});
router.post('/register/',upload,function(req,res){
  let {firstName,middleName,lastName,email,age,aadhaar,phone,dob,gender,password} = req.body;
  firstName  = firstName.toString().trim();
  middleName = middleName.toString().trim();
  lastName   = lastName.toString().trim();
  email       = email.toString().trim();
  aadhaar     = aadhaar.toString().trim();
  phone       = phone.toString().trim();
  dob         = dob.toString().trim();
  gender      = gender.toString().trim();

  if (firstName == "" || lastName == "" || email == "" || age == "" || dob == "" || gender == "" || phone == "") {
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
        console.log(req.body)
  }
  else{
    const user = new User ({
      firstName:   req.body.firstName,
      middleName: req.body.middleName,
      lastName:   req.body.lastName,
      email:       req.body.email,
      age :        req.body.age,
      aadhaar:      req.body.aadhaar,
      phone:       req.body.phone,
      dob:         req.body.dob,
      gender:      req.body.gender

    });
    user.save(function(err){
      if(err){
        res.json({error_message: /:(.+)/.exec(err.message)[1], status:"Failed"});
      }else{
        res.json({
            status: "SUCCESS",
        });
      }
    });
  }

});

router.patch('/register/:id',upload, function(req,res){
    let {firstName,middleName,lastName,email,age,aadhaar,phone,dob,gender} = req.body;
//   firstName  = firstName.toString().trim();
//   middleName = middleName.toString().trim();
//   lastName   = lastName.toString().trim();
//   email       = email.toString().trim();
//   aadhaar     = aadhaar.toString().trim();
//   phone       = phone.toString().trim();
//   dob         = dob.toString().trim();
//   gender      = gender.toString().trim();

  if (!(firstName && lastName && email && age && dob && gender && phone)) {
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
        //console.log(req.body)
  }
  else
  {

   User.updateOne(
     {_id  : req.params.id},
     {$set: req.body},{runValidators: true} ,
      function(err){
        if(err){
            res.json({error_message: /:(.+)/.exec(err.message)[1], status:"Failed"});
          }else{
            res.json({
                status: "SUCCESS",
            });
          }
        });
      }
    
    });


router.get('/application/:id',upload,function(req,res){
    if(req.body.button=="",req.body.button=="save")
     User.findOne({_id:req.params.id},function(err,users){
          if(!err) {

            res.send(users);
         }else{
            // console.log("ahaa kollaalo");
           res.send(err);
         }

    });
    else if (req.body.button=="submit")
    {
        User.findOne({_id:req.params.id},function(err,users){
            if(!err) {
                {
                    let{
                        nationality,motherTongue,bloodGroup,aPhone,annualIncome,bp1,bp2,bp3,hostelFacility,busFacility,imgPhotograph,imgSign}=users;
                    a=users;
                    console.log(users)
                    if(!(nationality && motherTongue && bloodGroup && aPhone && annualIncome))
                    {
                        res.json({
                            status:"FAILED",
                            message:"All fields are required"
                            
                        })
                    }
                    else
                        if(!(a.contactAddress.addressL1 && a.contactAddress.city && a.contactAddress.state && a.contactAddress.pincode))
                            {res.json({
                                status:"FAILED",
                                message:"Contact Address is incomplete"
                                
                            })
                            console.log(req.body)
                            console.log(req.body.contactAddress.addressL1)
                            //res.redirect()
        
                        }
                        else
                            if(!req.body.c_p && !( a.permanentAddress.city && a.permanentAddress.state && a.permanentAddress.pincode))
                            res.json({
                                status:"FAILED",
                                message:"Permanant Address is incomplete"
                            
                                
                            })
                            else{
        
                                if(!(a.fatherDetails.name && a.fatherDetails.occupation && a.fatherDetails.mobile && a.motherDetails.name && a.motherDetails.occupation && a.motherDetails.mobile && a.guardianDetails.name && a.guardianDetails.relation && a.guardianDetails.mobile ))
                                    res.json({
                                        status:"FAILED",
                                        message:"Parent / Guardian is incomplete"
                                        
                                    })
                                
                                else 
                                    if(!(a.NRIdetails.name && a.NRIdetails.relation))
                                        res.json({
                                            status:"FAILED",
                                            message:"NRI sponser details is incomplete"
                                            
                                        })
                                    else
                                        if(!(bp1 && bp2 && bp3))
                                            res.json({
                                                status:"FAILED",
                                                message:"Atleast 3 branchs should be kept"
                                                
                                            })
                                        else
                                            {
                                                ac=a.academicDetails
                                                if(!(ac.qualifyingExam && ac.phyMarkObtained && ac.phyMaxMarks && ac.chemMarkObtained && ac.chemMaxMarks && ac.mathsMarkObtained && ac.mathsMaxMarks))
                                                {
                                                    res.json({
                                                        status:"FAILED",
                                                        message:"Academic details incomplete"
                                                        
                                                    });
                                                }
                                                else
                                                    if(!(a.imgSign && a.imgPhotograph))
                                                    {
                                                        res.json({
                                                            status:"FAILED",
                                                            message:"Uploads are Missing"
                                                            
                                                        });
                                                    }

                                                    else
                                                    res.json({
                                                        status:"Submitted",
                                                        
                                                    })
                                        }
                                        
                                    }
                }
               
    
                
           }else{
             res.json({
                 status:'FAILED',
                 message:'Not registered'
             })
           }
    
      });
    }
    

    
});

router.patch('/application/:id',upload,async function(req,res){

    

    // res.json({cloudinaryId: uploadResult.public_id, url: uploadResult.secure_url});
  


    ///original code

    //edit is clicked


    //adding url of photograph to body


    if(req.files.imgPhotograph)
    {
        console.log('img1 uploaded\n')
        const file64 = formatBufferTo64(req.files.imgPhotograph[0]);
        const uploadResult = await cloudinaryUpload(file64.content);
        req.body.imgPhotograph=uploadResult.secure_url;
    }
    //adding url of sign to body
    if(req.files.imgSign)
    {
        console.log('img2 uploaded\n')
        const file64 = formatBufferTo64(req.files.imgSign[0]);
        const uploadResult = await cloudinaryUpload(file64.content);
        req.body.imgSign=uploadResult.secure_url;
    }
    // console.log(req.files)
    User.findOne({_id:req.params.id},function(err,users){
        if(!err) {
           
            if(req.body.c_p)
            { 
                req.body.permanentAddress = req.body.contactAddress ? req.body.contactAddress: users.contactAddress
                //console.log("new----"+req.body.permanentAddress)

            }
           {
                User.updateOne(
                    {_id  : req.params.id},
                    {$set: req.body},{runValidators: true} ,
                    function(err){
                    if(err){
                        res.json({error_message: /:(.+)/.exec(err.message)[1], status:"Failed"});
                        }else{
                        res.json({
                            status: "SUCCESS ",
                        });
                        }
                    });
            }

            
       }else{
         res.json({
             status:'FAILED',
             message:'Not registered'
         })
       }

  });
    
    
    
})

module.exports = router
