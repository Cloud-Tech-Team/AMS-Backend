const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary')
// const Datauri= require('datauri')
const path = require('path')

// For JWT token
const jwt = require('jsonwebtoken')

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
const upload = require('./../handler/multer')

// const datauri=require('./../handler/datauri')

// mongodb user model
const User = require('./../models/User')

const bcrypt = require('bcrypt')


router.post('/signup', upload, (req, res) => {
    let { firstName, email, password } = req.body
    console.log(req.body)
    // first_name = first_name;
    // email = email;

    if (firstName == "" || email == "" || password == "") {
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

router.post('/login', upload, (req, res) => {
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
                        const token = jwt.sign(
                            { user: email },
                            "secret_key"	// might want to replace
                        )

                        // Password matched
                        res.json({
                            status: "SUCCESS",
                            message: "Sign-in successful",
                            token: token,
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

router.patch('/password_reset', function (req, res) {
    let { currentPassword, newPassword, token, id } = req.body;

	// Verify the token
	jwt.verify(token, 'secret_key', function (err, decoded) {
		if (!err) {
			console.log('token verified');
			// Find user by id
			User.findOne({ _id: id }).then(user => {
				if (user) {
					console.log('password_reset: found user')
					console.log(user);
					// Check if currentPassword is correct
					const hashedPassword = user.password;       // Password retrieved from db
					console.log('user id: ', user._id);

					bcrypt.compare(currentPassword, hashedPassword).then(result => {
						if (result) {
							// Current password is correct. Now update with new password
							bcrypt.hash(newPassword, 10).then(newHashedPassword => {
								const filter = { _id: id };
								const update = { password: newHashedPassword };
								console.log('finding and updating', id, newHashedPassword)
								User.findOneAndUpdate(filter, update, function (err, doc) {
									if (err) {
										console.log('Error while updating password');
										res.json({ status: 'FAILED' });
									}
								});
							})

							res.json({
								status: 'SUCCESS',
								message: 'Password has been updated successfully'
							});
						} else {
							res.json({
								status: 'FAILED',
								message: 'Current password is incorrect'
							})
						}
					})
				} else {
					res.json({
						status: 'FAILED',
						message: 'Invalid user id'
					})
				}
			})
        } else {
            res.json({
                status: 'FAILED',
                message: 'Invalid token'
            });
        }
    });
})

router.get('/register', upload, function (req, res) {
    User.find(function (err, users) {
        if (!err) {

            res.send(users);
        } else {
            res.send(err);
        }

    });
});

router.get('/register/:id', upload, function (req, res) {
    User.findOne({ _id: req.params.id }, function (err, users) {
        if (!err) {

            res.send(users);
        } else {
            // console.log("ahaa kollaalo");
            res.send(err);
        }

    });
});
router.post('/register/', upload, function (req, res) {
    let { firstName, middleName, lastName, email, age, aadhaar, phone, dob, gender, password } = req.body;
    firstName = firstName.toString().trim();
    middleName = middleName.toString().trim();
    lastName = lastName.toString().trim();
    email = email.toString().trim();
    aadhaar = aadhaar.toString().trim();
    phone = phone.toString().trim();
    dob = dob.toString().trim();
    gender = gender.toString().trim();

    if (firstName == "" || lastName == "" || email == "" || age == "" || dob == "" || gender == "" || phone == "") {
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
        console.log(req.body)
    }
    else {
        const user = new User({
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            email: req.body.email,
            age: req.body.age,
            aadhaar: req.body.aadhaar,
            phone: req.body.phone,
            dob: req.body.dob,
            gender: req.body.gender

        });
        user.save(function (err) {
            if (err) {
                res.json({ error_message: /:(.+)/.exec(err.message)[1], status: "Failed" });
            } else {
                res.json({
                    status: "SUCCESS",
                });
            }
        });
    }

});

router.patch('/register/:id', upload, function (req, res) {
    let { firstName, middleName, lastName, email, age, aadhaar, phone, dob, gender } = req.body;
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
    else {

        User.updateOne(
            { _id: req.params.id },
            { $set: req.body }, { runValidators: true },
            function (err) {
                if (err) {
                    res.json({ error_message: /:(.+)/.exec(err.message)[1], status: "Failed" });
                } else {
                    res.json({
                        status: "SUCCESS",
                    });
                }
            });
    }

});


router.get('/application/:id', upload, function (req, res) {
    if (req.body.button == "", req.body.button == "save")
        User.findOne({ _id: req.params.id }, function (err, users) {
            if (!err) {

                res.send(users);
            } else {
                // console.log("ahaa kollaalo");
                res.send(err);
            }

        });
    else if (req.body.button == "submit") {
        User.findOne({ _id: req.params.id }, function (err, users) {
            if (!err) {
                {
                    let {
                        nationality, motherTongue, bloodGroup, aPhone, annualIncome, bp1, bp2, bp3, hostelFacility, busFacility, imgPhotograph, imgSign } = users;
                    a = users;
                    console.log(users)
                    if (!(nationality && motherTongue && bloodGroup && aPhone && annualIncome)) {
                        res.json({
                            status: "FAILED",
                            message: "All fields are required"

                        })
                    }
                    else
                        if (!(a.contactAddress.addressL1 && a.contactAddress.city && a.contactAddress.state && a.contactAddress.pincode)) {
                            res.json({
                                status: "FAILED",
                                message: "Contact Address is incomplete"

                            })
                            console.log(req.body)
                            console.log(req.body.contactAddress.addressL1)
                            //res.redirect()

                        }
                        else
                            if (!req.body.c_p && !(a.permanentAddress.city && a.permanentAddress.state && a.permanentAddress.pincode))
                                res.json({
                                    status: "FAILED",
                                    message: "Permanant Address is incomplete"


                                })
                            else {

                                if (!(a.fatherDetails.name && a.fatherDetails.occupation && a.fatherDetails.mobile && a.motherDetails.name && a.motherDetails.occupation && a.motherDetails.mobile && a.guardianDetails.name && a.guardianDetails.relation && a.guardianDetails.mobile))
                                    res.json({
                                        status: "FAILED",
                                        message: "Parent / Guardian is incomplete"

                                    })

                                else
                                    if (!(a.NRIdetails.name && a.NRIdetails.relation))
                                        res.json({
                                            status: "FAILED",
                                            message: "NRI sponser details is incomplete"

                                        })
                                    else
                                        if (!(bp1 && bp2 && bp3))
                                            res.json({
                                                status: "FAILED",
                                                message: "Atleast 3 branchs should be kept"

                                            })
                                        else {
                                            ac = a.academicDetails
                                            if (!(ac.qualifyingExam && ac.phyMarkObtained && ac.phyMaxMarks && ac.chemMarkObtained && ac.chemMaxMarks && ac.mathsMarkObtained && ac.mathsMaxMarks)) {
                                                res.json({
                                                    status: "FAILED",
                                                    message: "Academic details incomplete"

                                                });
                                            }
                                            else
                                                if (!(a.imgSign && a.imgPhotograph)) {
                                                    res.json({
                                                        status: "FAILED",
                                                        message: "Uploads are Missing"

                                                    });
                                                }

                                                else
                                                    res.json({
                                                        status: "Submitted",

                                                    })
                                        }

                            }
                }



            } else {
                res.json({
                    status: 'FAILED',
                    message: 'Not registered'
                })
            }

        });
    }



});

router.patch('/application/:id', upload, async function (req, res) {

    ///original code
    //edit is clicked
    //adding url of photograph to body
    if (req.files.imgPhotograph) {
        console.log('img1 uploaded\n')
        const file64 = formatBufferTo64(req.files.imgPhotograph[0]);
        const uploadResult = await cloudinaryUpload(file64.content);
        req.body.imgPhotograph = uploadResult.secure_url;
    }
    //adding url of sign to body
    if (req.files.imgSign) {
        console.log('img2 uploaded\n')
        const file64 = formatBufferTo64(req.files.imgSign[0]);
        const uploadResult = await cloudinaryUpload(file64.content);
        req.body.imgSign = uploadResult.secure_url;
    }
    // console.log(req.files)
    User.findOne({ _id: req.params.id }, function (err, users) {
        if (!err) {

            if (req.body.c_p) {
                req.body.permanentAddress = req.body.contactAddress ? req.body.contactAddress : users.contactAddress
            }
            {
                a = req.body
                const update = {

                    firstName: a.fname || users.firstName || users.a,
                    middleName: a.mName || users.middleName || users.a,
                    lastName: a.lName || users.lastName || users.a,
                    email: a.lName || users.email || users.a,
                    age: a.age || users.age || users.a,
                    aadhaar: a.aadhaar || users.aadhaar || users.a,
                    phone: a.phone || users.phone || users.a,
                    aPhone: a.aPhone || users.aPhone || users.a,
                    dob: a.dob || users.dob || users.a,
                    gender: a.gender || users.gender || users.a,
                    password: a.password || users.password || users.a,
                    nationality: a.nationality || users.nationality || users.a,
                    motherTongue: a.motherTongue || users.motherTongue || users.a,
                    bloodGroup: a.bloodGroup || users.bloodGroup || users.a,
                    contactAddress: {
                        addressL1: a.addressL1C || users.contactAddress.addressL1 || users.a,
                        addressL2: a.addressL2C || users.contactAddress.addressL2 || users.a,
                        city: a.cityC || users.contactAddress.city || users.a,
                        state: a.stateC || users.contactAddress.state || users.a,
                        pincode: a.pincodeC || users.contactAddress.pincode || users.a
                    },
                    permanentAddress: {
                        addressL1: a.addressL1P || users.permanentAddress.addressL1 || users.a,
                        addressL2: a.addressL2P || users.permanentAddress.addressL2 || users.a,
                        city: a.cityP || users.permanentAddress.city || users.a,
                        state: a.stateP || users.permanentAddress.state || users.a,
                        pincode: a.pincodeP || users.permanentAddress.pincode || users.a

                    },
                    fatherDetails: {
                        name: a.fatherName || users.fatherDetails.name || users.a,
                        occupation: a.fatherOccupation || users.fatherDetails.occupation || users.a,
                        mobile: a.fatherMobile || users.fatherDetails.mobile || users.a,
                        email: a.fatherEmail || users.fatherDetails.email || users.a
                    },
                    motherDetails: {
                        name: a.motherName || users.motherDetails.name || users.a,
                        occupation: a.motherOccupation || users.motherDetails.occupation || users.a,
                        mobile: a.motherMobile || users.motherDetails.moblie || users.a,
                        email: a.motherEmail || users.motherDetails.email || users.a
                    },
                    guardianDetails: {
                        name: a.guardianName || users.guardianDetails.name || users.a,
                        relation: a.guardianRelation || users.guardianDetails.relation,
                        mobile: a.guardianMobile || users.guardianDetails.moblie || users.a,
                        email: a.guardianEmail || users.guardianDetails.email || users.a
                    },
                    annualIncome: a.annualIncome || users.annualIncome || users.a,
                    NRIdetails: {
                        name: a.NRIname || users.NRIdetails.name || users.a,
                        relation: a.NRIrelation || users.NRIdetails.relation || users.a
                    },
                    bp1: a.bp1 || users.bp1 || users.a,
                    bp2: a.bp2 || users.bp2 || users.a,
                    bp3: a.bp3 || users.bp3 || users.a,
                    bp4: a.bp4 || users.bp4 || users.a,
                    bp5: a.bp5 || users.bp5 || users.a,
                    busFacility: a.busFacility || users.busFacility || users.a,
                    hostelFacility: a.hostelFacility || users.hostelFacility || users.a,
                    academicDetails: {
                        qualifyingExam: a.qualifyingExam || users.qualifyingExam || users.a,
                        phyMarkObtained: a.phyMarkObtained || users.phyMarkObtained || users.a,
                        phyMaxMarks: a.phyMaxMarks || users.phyMaxMarks || users.a,
                        chemMarkObtained: a.chemMarkObtained || users.chemMarkObtained || users.a,
                        chemMaxMarks: a.chemMaxMarks || users.chemMaxMarks || users.a,
                        mathsMarkObtained: a.mathsMarkObtained || users.mathsMarkObtained || users.a,
                        mathsMaxMarks: a.mathsMaxMarks || users.mathsMaxMarks || users.a
                    },
                    imgPhotograph: a.imgPhotograph || users.imgPhotograph || users.a,
                    imgSign: a.imgSign || users.imgSign || users.a
                }
                User.updateOne(
                    { _id: req.params.id },
                    { $set: update }, { runValidators: true },
                    function (err) {
                        if (err) {
                            res.json({ error_message: /:(.+)/.exec(err.message)[1], status: "Failed" });
                        } else {
                            res.json({
                                status: "SUCCESS ",
                            });
                        }
                    });
            }
        } else {
            res.json({
                status: 'FAILED',
                message: 'Not registered'
            })
        }

    });



})

module.exports = router
