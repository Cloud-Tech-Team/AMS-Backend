const express = require('express')
const router = express.Router()

const multer =require('multer'); // form-data multipart
const upload = multer();
// mongodb user model
const User = require('./../models/User')

const bcrypt = require('bcrypt')


router.post('/signup',upload.none(), (req, res) => {
    let {first_name, email, password } = req.body
    console.log(req.body)
    first_name = first_name.toString().trim();
    email = email.toString().trim();

    if (first_name == "" || email == "" || password == "" ) {
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
                        first_name,
                        email,
                        password: hashedPassword,

                    })

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup Successful",
                            data: result
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

router.post('/signin',upload.none(), (req, res) => {
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
                            message: "Sign-in successful",
                            data: data
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


router.get('/register',upload.none(),function(req,res){
    User.find(function(err,users){
          if(!err) {

            res.send(users);
         }else{
            console.log("ahaa kollaalo");
           res.send(err);
         }

    });
});
router.get('/register/:id',upload.none(),function(req,res){
     User.findOne({_id:req.params.id},function(err,users){
          if(!err) {

            res.send(users);
         }else{
            console.log("ahaa kollaalo");
           res.send(err);
         }

    });
});
router.post('/register/',upload.none(),function(req,res){
  let {first_name,middle_name,last_name,email,age,aadhaar,phone,dob,gender,password} = req.body;
  first_name  = first_name.trim();
  middle_name = middle_name.trim();
  last_name   = last_name.trim();
  email       = email.trim();
  aadhaar     = aadhaar.trim();
  phone       = phone.trim();
  dob         = dob.trim();
  gender      = gender.trim();

  if (first_name == "" || last_name == "" || email == "" || age == "" || dob == "" || gender == "" || phone == "") {
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
  }
  else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
              res.json({
                  status: "FAILED",
                  message: "Invalid email"
              })
  }
  else if(aadhaar.length != 12) {
    res.json({
        status: "FAILED",
        message: "Invalid aadhaar no."
    })
  }
  else if(gender!="Female" && gender!="Male" && gender!="Other"){

    res.json({
        status: "FAILED",
        message: "Invalid gender"
    })
  }
  else if(phone.length!=10){
    res.json({
        status: "FAILED",
        message: "Invalid phone number format"
    })
  }
  else if (!new Date(dob).getTime()) { //mm-dd-yyyy or yyyy-mm-dd
        res.json({
            status: "FAILED",
            message: "Invalid date of birth"
        })
  }
  else{
    const user = new User ({
      first_name:   req.body.first_name,
      middle_name: req.body.middle_name,
      last_name:   req.body.last_name,
      email:       req.body.email,
      age :        req.body.age,
      aadhaar:      req.body.aadhaar,
      phone:       req.body.phone,
      dob:         req.body.dob,
      gender:      req.body.gender

    });
    user.save(function(err){
      if(err){
        res.send(err);
      }else{
        res.send("Success");
      }
    });
  }

});


router.patch('/register/:id',upload.none(), function(req,res){


   User.updateOne(
     {_id  : req.params.id},
     {$set: req.body},
      function(err){
        if(err){
          res.send(err);
        }else{
          res.send("Success");
        }
      });

});

module.exports = router
