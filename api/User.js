const express = require('express')

const router = express.Router()




//for uploading to cloudinary
const cloudinary = require('cloudinary')

// const Datauri= require('datauri')
const path = require('path')

// For JWT token
const jwt = require('jsonwebtoken')

// For validating date input
const moment = require('moment')

//uploading files
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();
const multer = require('multer');
const fs = require("fs");
const upload2 = multer({ dest: "./public/files" });
const findRemoveSync = require('find-remove');

express().use(express.static(__dirname + '/public'));

const formatBufferTo64 = file =>
    parser.format(path.extname(file.originalname).toString(), file.buffer)

const cloudinaryUpload = file => cloudinary.uploader.upload(file);

//textmessaging
var client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

//Email
const sgMail = require('@sendgrid/mail')
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


require('./../config/cloudinary')
const upload = require('./../handler/multer')



//models
const User = require('../models/User')
const Branch = require('../models/Branches')

const Auth = require('../controllers/auth')
const Password = require('../controllers/password')


const bcrypt = require('bcrypt')

//verify jwt
const verifyToken = require('../middleware/verifyToken');
// router.post('/signup', Auth.signup);

router.post('/login', upload, Auth.login);

router.post('/recover', Password.recover);

router.post('/register', upload, async function (req, res) {
    let { quota, firstName, middleName, lastName, email,aadhaar, phone, dob, gender, password } = req.body;
	console.log(req.body);
    // quota = quota.toString().trim();
    // firstName = firstName.toString().trim();
    // middleName = middleName.toString().trim();
    // lastName = lastName.toString().trim();
    // email = email.toString().trim();
    // aadhaar = aadhaar.toString().trim();
    // phone = phone.toString().trim();
   // dob = dob.toString().trim();
    // gender = gender.toString().trim();

    if (firstName == "" || lastName == "" || email == "" || dob == "" || gender == "" || quota == "" || aadhaar=="") {
		res.status(400);
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
        console.log(req.body)
    } else {
		var query = {email: email, quota: quota, course: req.body.course,academicYear:req.body.academicYear}
		const stu = await User.findOne(query)
		if (stu) {
			console.log(`error: student exists ${stu}`)
			res.status(409)
			return res.json({
				status: 'FAILED',
				message: `User has already registered for ${quota} ${academicYear}and ${req.body.course}`
			})
		}
		console.log('student does not exist')
		if (moment(req.body.dob, 'YYYY-MM-DD', true).isValid() == false) {
			res.status(400);
			return res.json({
				status: 'FAILED',
				message: 'Invalid date of birth'
			});
		}

		const user = new User({
			quota:req.body.quota,
			course:req.body.course,
            academicYear:req.body.academicYear,
			firstName: req.body.firstName,
			middleName: req.body.middleName,
			lastName: req.body.lastName,
			email: req.body.email,
			aadhaar: req.body.aadhaar,
			phone: req.body.phone,
			dob: req.body.dob,
			gender: req.body.gender,
		});

		const studentCount = await User.studentCount()
		console.log(`studentCount = ${studentCount}`)
		if (studentCount == null) {
			console.log('error finding total no of users');
			res.status(500);	// 500 Internal Server Error
			return res.json({
				status: "FAILED",
				message: "Error generating application number"
			});
		}
		// maybe let them find count on its own...
		user.generateApplicationNo(studentCount);	
		password = user.generatePassword(studentCount);
		console.log('AppNo: ' + user.applicationNo);
		console.log('Password: ' + password);

		user.password = password;							// store plaintext password :/
		user.save(function (err) {
			if (err) {
				console.log('error saving user');
				res.status(500);
				res.json({status: "FAILED", message: err.message});
				console.log(err);
			} else {
				console.log('saved user successfully');
				res.status(200);
				res.json({status: "SUCCESS"});
				if (user.phone) {
					//merging country code and phone number
					//phone=user.countryCode+user.phone;
					phone = '+91' + user.phone;
					client.messages.create({
						from: process.env.TWILIO_PHONE_NUMBER,
						to: phone,
						body: `Hi ${user.firstName},\nYou have registered for ${user.course} ${user.quota} 20${user.academicYear} at Muthoot Institute of Technology and Science\nYour application number: ${user.applicationNo}\nPassword: ${password}.\n\nPlease login and complete the application.\n\nTeam MITS
												\n`
					}).then((message) => console.log(message.sid)).catch(err => {
						console.log(err)
					});
				}
				if (user.email) {
					const msg = {
						to: user.email, // Change to your recipient
						from: 'ams.mits23@gmail.com', // Change to your verified sender
						subject: 'Registration Successful',
						text: `Hi ${user.firstName},\nYou have registered for ${user.course} ${user.quota} 20${user.academicYear} at Muthoot Institute of Technology and Science\nYour Registration Number: ${user.applicationNo}\nPassword: ${password}.\n\nPlease login and complete the application.\n\nTeam MITS
  \n`
					}
					sgMail.send(msg).then((response) => {
						console.log(response[0].statusCode)
						console.log(response[0].headers)
					}) .catch((error) => {
						console.error(error)
					})
				}
			}
		});
	}
});


router.get('/application/:id', verifyToken, upload, function (req, res) {
    if (req.body.button == "", req.body.button == "save")
        User.findOne({ applicationNo: req.params.id }, function (err, user) {
            if (!err) {
				res.status(200);
                res.send(user);
            } else {
                res.send(err);
            }

        });
    else if (req.body.button == "submit") {
        User.findOne({ applicationNo: req.params.id }, function (err, users) {
            if (!err) {
                {
                    let {
                        nationality, motherTongue, bloodGroup, aPhone, annualIncome, bp1, hostelFacility, busFacility, imgPhotograph, imgSign } = users;
                    a = users;
                    console.log(users)
                    if (!(nationality && motherTongue && bloodGroup && aPhone && annualIncome)) {
						res.status(400);
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
                                        if (!(bp1))
                                            res.json({
                                                status: "FAILED",
                                                message: "Atleast 1 branchs should be kept"

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

/* update only the NRI relations details.
 * Requested by Abijith Biju (MUT19CS005)
 */
router.patch('/quota_edit/', upload, async function (req, res) {
	const token = req.headers.authorization.split(" ")[1];
	var decoded;
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
	console.log("role:"+decoded.role);
	console.log('request body')
	console.log(req.body)
	User.findOneAndUpdate({applicationNo: decoded.appNo},
		{$set: {
			quota: req.body.quota,
			NRIdetails: req.body.NRIdetails	// name and relation
		}}, // add options here
		function (err, user) {
			console.log(`appNo: ${decoded.appNo}`)
			if (err) {
				console.log(`error updating: ${err.message}`)
				res.status(500)
				return res.json({
					status: 'FAILED',
					message: err.message
				})
			}
			console.log('updated successfully')
			console.log(user)
			res.status(200)
			res.json({
				status: 'SUCCESS',
				message: 'Updated quota and relation details successfully'
			})
		}
	)
})

router.patch('/application/:id', verifyToken, upload, async function (req, res) {


    if(req.files){
        if (req.files.filePhotograph) {
            const file64 = formatBufferTo64(req.files.filePhotograph[0]);
            const uploadResult = await cloudinaryUpload(file64.content);
            req.body.filePhotograph = uploadResult.secure_url;
            if(req.body.filePhotograph!=null)
                console.log('Photograph uploaded\n');
        }
        //adding url of sign to body
        if (req.files.fileSign) {
            const file64 = formatBufferTo64(req.files.fileSign[0]);
            const uploadResult = await cloudinaryUpload(file64.content);
            req.body.fileSign = uploadResult.secure_url;
            if(req.body.fileSign!=null)
                console.log('Signature uploaded\n');
        }
    
        if(req.files.fileTransactionID){
            const file64 = formatBufferTo64(req.files.fileTransactionID[0]);
            const uploadResult = await cloudinaryUpload(file64.content);
            req.body.fileTransactionID = uploadResult.secure_url;
            if(req.body.fileTransactionID!=null)
                console.log('Transaction File uploaded\n')
        }
    }

    //adding url of photograph to body
    
    // console.log(req.files)
    User.findOne({ applicationNo: req.params.id }, function (err, users) {
        if (!err) {

            if (req.body.c_p) {
                req.body.permanentAddress = req.body.contactAddress ? req.body.contactAddress : users.contactAddress
            }
            {
                a = req.body
                const update = {

                    firstName: a.firstName || users.firstName || users.a,
                    middleName: a.middleName || users.middleName || users.a,
                    lastName: a.lastName || users.lastName || users.a,
                    aadhaar: a.aadhaar || users.aadhaar || users.a,
                    aPhone: a.aPhone || users.aPhone || users.a,
                    nationality: a.nationality || users.nationality || users.a,
                    motherTongue: a.motherTongue || users.motherTongue || users.a,
                    bloodGroup: a.bloodGroup || users.bloodGroup || users.a,
                    contactAddress: {
                        addressL1: a.addressL1C || users.contactAddress.addressL1 || users.a,
                        district: a.districtC || users.contactAddress.district || users.a,
                        city: a.cityC || users.contactAddress.city || users.a,
                        state: a.stateC || users.contactAddress.state || users.a,
                        pincode: a.pincodeC || users.contactAddress.pincode || users.a
                    },
                    permanentAddress: {
                        addressL1: a.addressL1P || users.permanentAddress.addressL1 || users.a,
                        district: a.districtP || users.permanentAddress.district || users.a,
                        city: a.cityP|| users.permanentAddress.city || users.a,
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
                    filePhotograph: a.filePhotograph || users.filePhotograph || users.a,
                    fileSign: a.fileSign || users.fileSign || users.a,
                    transactionID:a.transactionID ||users.transactionID ||users.a,
                    fileTransactionID:a.fileTransactionID || users.fileTransactionID || users.a
                }
                User.updateOne(
                    { applicationNo: req.params.id },
                    { $set: update }, { runValidators: true },
                    function (err) {
                        if (err) {
                            res.json({ error_message: err.message, status: "FAILED" });
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

router.get('/application', upload, function (req, res){
    if(req.body.token){
        token=req.body.token;
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        console.log(decoded.email);
        id=decoded.id;
        User.findOne({_id:id},function(err,user){
            if(!err){
                res.status(200);
                res.json({
                    status:"SUCESS",
                    message:"Application no is added",
                    application:user.applicationNo,
                    dob:user.dob,
                    firstName:user.firstName,
                    phone:user.phone,
                })
            }
            else{
                res.status(400);
                res.json({
                    status:"FAILED",
                    message:"Not registered"
                })
            }
        })


    }
    
})


//nri get
router.get('/nri/application', function (req, res){
    if(req.headers.authorization){
        // token=req.body.token;
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        console.log(decoded.email);
        id=decoded.id;
        User.findOne({_id:id},function(err,user){
            if(!err){
                res.status(200);
                res.json({
                    status:"SUCCESS",
                    message:"Application no is added",
                    user:user
                })
            }
            else{
                res.status(500);
                res.json({
                    status:"FAILED",
                    message:"An error occured while checking for existance of user"
                })
            }
        })


    }
    else{
        res.json({
            status:"FAILED",
            message:"Access token error"
        })
    }
    
});

//nri patch
router.patch('/nri/application/:applicationNo', verifyToken, upload, function (req, res) {

    User.findOne({ applicationNo: req.params.applicationNo },async function (err, users) {
        if(users!=null){
            if(users.quota=='NRI'){
                // console.log("--------"+users)
                // uploading files to cloudinary
                if(req.files){
                    if (req.files.filePhotograph) {
                        const file64 = formatBufferTo64(req.files.filePhotograph[0]);
                        const uploadResult = await cloudinaryUpload(file64.content);
                        req.body.filePhotograph = uploadResult.secure_url;
                        if(req.body.filePhotograph!=null)
                            console.log('Photograph uploaded\n');
                    }
                    //adding url of sign to body
                    if (req.files.fileSign) {
                        const file64 = formatBufferTo64(req.files.fileSign[0]);
                        const uploadResult = await cloudinaryUpload(file64.content);
                        req.body.fileSign = uploadResult.secure_url;
                        if(req.body.fileSign!=null)
                            console.log('Signature uploaded\n');
                    }
                
                    // if(req.files.fileTransactionID){
                    //     const file64 = formatBufferTo64(req.files.fileTransactionID[0]);
                    //     const uploadResult = await cloudinaryUpload(file64.content);
                    //     req.body.fileTransactionID = uploadResult.secure_url;
                    //     if(req.body.fileTransactionID!=null)
                    //         console.log('Transaction File uploaded\n')
                    // }
                }
    
                if(req.body.bp1 && users.bp1==null && users.quota==NRI){
                    console.log('-----')
                    Branch.findOne({branch:req.body.bp1},function(err,branch){
                        if(branch)
                        {
                            if(!branch.isFilled() && !branch.isNRIFilled()){
                                branch.occupySeat();
                                branch.occupySeatNRI();
                                console.log("Seat Available");
                            }
                            else{
                                console.log("Waiting list"+branch.waitingListNumberNRI());
                            }
                            branch.save();
                            // console.log(branch.totalSeats);
                            // console.log(branch.occupiedSeats);
							// console.log(branch.isFilled());
                        }
                    })
                }
    
                body=req.body;
                // console.log(body);
                    const fatherDetails={
                        fatherDetails: {
                        name: a.fatherName || users.fatherDetails.name || users.a,
                        occupation: a.fatherOccupation || users.fatherDetails.occupation || users.a,
                        mobile: a.fatherMobile || users.fatherDetails.mobile || users.a,
                        email: a.fatherEmail || users.fatherDetails.email || users.a
                        }
                     }

                const contactAddress={
                    contactAddress: {
                        addressL1: a.addressL1C || users.contactAddress.addressL1 || users.a,
                        district: a.districtC || users.contactAddress.district || users.a,
                        city: a.cityC || users.contactAddress.city || users.a,
                        state: a.stateC || users.contactAddress.state || users.a,
                        pincode: a.pincodeC || users.contactAddress.pincode || users.a
                    }
                }

                const permanantAddress={
                    permanentAddress:{
                        addressL1: body.addressL1P || users.permanentAddress.addressL1 || users.a,
                        district: body.districtP || users.permanentAddress.district || users.a,
                        city: body.cityP|| users.permanentAddress.city || users.a,
                        state: body.stateP || users.permanentAddress.state || users.a,
                        pincode: body.pincodeP || users.permanentAddress.pincode || users.a
                    }
                }
    
                // const guardian={
                //     guardianDetails:{
                //         name: body.guardianName || users.guardianDetails.name || users.a,
                //         occupation: body.guardianOccupation || users.guardianDetails.occupation || users.a,
                //         relation:body.gruardianRelation || users.guardianDetails.relation || users.a,
                //     }
                // }
    
                const sponser={
                    NRIdetails:{
                        name:body.NRIname || users.NRIdetails.name || users.a,
                        relation:body.NRIrelation || users.NRIdetails.relation 
                    }
                }
    
                var update=Object.assign({},body,permanantAddress,contactAddress,guardian,sponser,fatherDetails);
    
                console.log(update);
                
                User.updateOne(
                    { applicationNo: req.params.applicationNo },
                    { $set: update}, { runValidators: true },
                    function (err) {
                        if (err) {
                            res.json({ 
                                message: err.message,
                                status: "FAILED" 
                            });
                        } else {
                            res.status(200);
                            res.json({
                                status: "SUCCESS",
                                message:'Details edited successfully'
                            });
                        }
                    });
       
            }
        }
        
        else{
            console.log('could not find user ' + req.params.applicationNo)
			res.status(500);
            res.json({
				status: "FAILED",
                message: "An error occured while checking for existance of user"
            })
        }
        
    })

});


router.patch('/nri/application-page1/:applicationNo', verifyToken, upload, function (req, res) {


    User.findOne({ applicationNo: req.params.applicationNo },async function (err, users) {
        if(users!=null){
            if(users.quota=='NRI'){
                if(req.files){
                    if (req.files.filePhotograph) {
                        const file64 = formatBufferTo64(req.files.filePhotograph[0]);
                        const uploadResult = await cloudinaryUpload(file64.content);
                        req.body.filePhotograph = uploadResult.secure_url;
                        if(req.body.filePhotograph!=null)
                            console.log('Photograph uploaded\n');
                    }
                   
                }
    
                body=req.body;
                // console.log(body);

                const general={
                    aPhone:body.aPhone || users.aPhone|| users.a,
                    filePhotograph:body.filePhotograph || users.filePhotograph || users.a,
                    firstName:body.firstName || users.firstName || users.a,
                    middleName:body.middleName || users.middleName|| users.a,
                    lastName:body.lastName || users.lastName || users.a


                }

                const contactAddress={
                    contactAddress: {
                        addressL1: body.addressL1C || users.contactAddress.addressL1 || users.a,
                        district: body.districtC || users.contactAddress.district || users.a,
                        city: body.cityC || users.contactAddress.city || users.a,
                        state: body.stateC || users.contactAddress.state || users.a,
                        pincode: body.pincodeC || users.contactAddress.pincode || users.a
                    }
                }

                const permanantAddress={
                    permanentAddress:{
                        addressL1: body.addressL1P || users.permanentAddress.addressL1 || users.a,
                        district: body.districtP || users.permanentAddress.district || users.a,
                        city: body.cityP|| users.permanentAddress.city || users.a,
                        state: body.stateP || users.permanentAddress.state || users.a,
                        pincode: body.pincodeP || users.permanentAddress.pincode || users.a
                    }
                }

                 const guardian={
                        guardianDetails:{
                            name: body.guardianName || users.guardianDetails.name || users.a,
                            occupation: body.guardianOccupation || users.guardianDetails.occupation || users.a,
                            relation:body.gruardianRelation || users.guardianDetails.relation || users.a,
                        }
                }
                const sponser={
                    NRIdetails:{
                        name:body.NRIname || users.NRIdetails.name || users.a,
                        relation:body.NRIrelation || users.NRIdetails.relation 
                    }
                }
    
                
    
                var update=Object.assign({},general,permanantAddress,contactAddress,guardian,sponser);
    
                update.aPhone=body.aPhone
                console.log(update);
                
                User.updateOne(
                    { applicationNo: req.params.applicationNo },
                    { $set: update}, { runValidators: true },
                    function (err) {
                        if (err) {
                            res.json({ 
                                message: err.message,
                                status: "FAILED" 
                            });
                        } else {
                            res.status(200);
                            res.json({
                                status: "SUCCESS",
                                message:'Details edited successfully'
                            });
                        }
                    });
            }
        }
        else{
            console.log('could not find user ' + req.params.applicationNo)
			res.status(500);
            res.json({
				status: "FAILED",
                message: "An error occured while checking for existance of user"
            })
        }
        
    })

});


router.patch('/nri/application-page2/:applicationNo', verifyToken, upload, function (req, res) {


    User.findOne({ applicationNo: req.params.applicationNo },async function (err, users) {
        if(users!=null){
            if(users.quota=='NRI'){
                if(req.files){
                    if (req.files.fileKeam) {
                        const file64 = formatBufferTo64(req.files.fileKeam[0]);
                        const uploadResult = await cloudinaryUpload(file64.content);
                        req.body.fileKeam = uploadResult.secure_url;
                        if(req.body.fileKeam!=null)
                            console.log('Keam certificate uploaded --'+req.params.applicationNo);
                    }
                    if (req.files.file12th) {
                        const file64 = formatBufferTo64(req.files.file12th[0]);
                        const uploadResult = await cloudinaryUpload(file64.content);
                        req.body.file12th = uploadResult.secure_url;
                        if(req.body.file12th!=null)
                            console.log('12th certificate uploaded --'+req.params.applicationNo);
                    }
                    if (req.files.file10th) {
                        const file64 = formatBufferTo64(req.files.file10th[0]);
                        const uploadResult = await cloudinaryUpload(file64.content);
                        req.body.file10th = uploadResult.secure_url;
                        if(req.body.file10th!=null)
                            console.log('10th certificate uploaded --'+req.params.applicationNo);
                    }
                   
                }
                body=req.body;
                // console.log(body);
                const grade12={
                    grade12:{
                        school:body.plustwoschool  || users.grade12.school|| users.a,
                        board:body.plustwoboard || users.grade12.board|| users.a,
                        registerNumber:body.plustworegno   || users.grade12.registerNumber|| users.a,
                        year:body.plustwoyear    || users.grade12.year|| users.a,
                        attemptNumber:body.plustwoAttempt || users.grade12.attemptNumber|| users.a,
                        mark:body.plustwomark    || users.grade12.mark|| users.a,
                        maxMark:body.plustwomaxmark || users.grade12.maxMark|| users.a,
                        percentage:body.plustwoperc    || users.grade12.percentage|| users.a,
                        markEnglish:body.plustwoengmark || users.grade12.markEnglish|| users.a,
                        markMaths:body.plustwomtsmark || users.grade12.markMaths|| users.a,
                        markCS:body.plustwocsmark  || users.grade12.markCS|| users.a,
                        markPhy:body.plustwophymark  || users.grade12.markCS|| users.a,
                        markBio:body.plustwobiomark  || users.grade12.markBio|| users.a,
                        markChem:body.plutwochemark  || users.grade12.markChem|| users.a,
                        marksheet:body.file12th || users.grade12.marksheet|| users.a,
                      },
                }
                const grade10={
                    grade10:{
                        school:body.sslcschool      || users.grade10.school|| users.a,
                        board:body.sslcboard      || users.grade10.board|| users.a,
                        markEnglish:body.sslcengmark    || users.grade10.markEnglish|| users.a,
                        markMaths:body.sslcmtsmark    || users.grade10.markMaths|| users.a,
                        markCS:body.sslccsmark     || users.grade10.markCS|| users.a,
                        markPhy:body.sslcphymark      || users.grade10.markCS|| users.a,
                        markBio:body.sslcbiomark     || users.grade10.markBio|| users.a,
                        markChem:body.sslcchemmark    || users.grade10.markChem|| users.a,
                        marksheet:body.file10th       || users.grade10.marksheet|| users.a,
                      
                      },
                }

                const keam={
                    keam:{
                        rollNumber:body.keamrollno   || users.keam.rollNumber|| users.a,
                        year:body.keamyear      || users.keam.year|| users.a,
                        rank:body.keamrank     || users.keam.rank|| users.a,
                        markPaper1:body.keampaper1 || users.keam.markPaper1|| users.a,
                        markPaper2:body.keampaper2           || users.keam.markPaper2|| users.a,
                        totalMark:body.keamtotal       || users.keam.totalMark|| users.a,
                        file:body.fileKeam    || users.keam.file|| users.a
                      },
                }
                var update=Object.assign({},keam,grade10,grade12);
    
                console.log(update);
                
                User.updateOne(
                    { applicationNo: req.params.applicationNo },
                    { $set: update}, { runValidators: true },
                    function (err) {
                        if (err) {
                            res.json({ 
                                message: err.message,
                                status: "FAILED" 
                            });
                        } else {
                            res.status(200);
                            res.json({
                                status: "SUCCESS",
                                message:'Details edited successfully'
                            });
                        }
                    });
    
    
    
            }
        }
        
        else{
            console.log('could not find user ' + req.params.applicationNo)
			res.status(500);
            res.json({
				status: "FAILED",
                message: "An error occured while checking for existance of user"
            })
        }
        
    })
});

router.patch('/nri/application-page3/:id',verifyToken,upload,async function(req,res){

   
        if(req.files){
            if (req.files.imgSign) {
                const file64 = formatBufferTo64(req.files.imgSign[0]);
                const uploadResult = await cloudinaryUpload(file64.content);
                req.body.imgSign = uploadResult.secure_url;
                if(req.body.imgSign!=null)
                    console.log('Signature uploaded\n');
            }
        }
        User.findOne({ applicationNo: req.params.id }, function (err, users) {
            if (!err) {
    
                    a = req.body
                    const update = {
    
                        
                        bp1: a.bp1 || users.bp1 || users.a,
                        // bp2: a.bp2 || users.bp2 || users.a,
                        // bp3: a.bp3 || users.bp3 || users.a,
                        // bp4: a.bp4 || users.bp4 || users.a,
                        // bp5: a.bp5 || users.bp5 || users.a,
                        imgSign: a.imgSign || users.imgSign || users.a,
                        
                     }
                    User.updateOne(
                        { applicationNo: req.params.id },
                        { $set: update }, { runValidators: true },
                        function (err) {
                            if (err) {
                                res.json({ error_message: err.message, status: "FAILED" });
                            } else {
                                res.json({
                                    status: "SUCCESS ",
                                });
                            }
                        });
                    }else {
                res.json({
                    status: 'FAILED',
                    message: 'Not registered'
                })
            }
        
    
        });
    
})


router.patch('/nri/application-page5/:id',verifyToken,upload,async function(req,res){

    if(req.files){
        if (req.files.fileTransactionID) {
            const file64 = formatBufferTo64(req.files.fileTransactionID[0]);
            const uploadResult = await cloudinaryUpload(file64.content);
            req.body.fileTransactionID = uploadResult.secure_url;
            if(req.body.fileTransactionID!=null)
                console.log('Transaction proof uploaded\n');
        }
    }
    User.findOne({ applicationNo: req.params.id }, function (err, user) {
        if (!err) {

                a = req.body
                if (!(a.fileTransactionID)) {
                    res.json({
                        status: "FAILED",
                        message: "Uploads are Missing"


                    });
                }
                else{
                    
                    
                const update = {

                    transactionID:a.transactionID ||users.transactionID ||users.a,
                    fileTransactionID:a.fileTransactionID || users.fileTransactionID || users.a
                  
                    
                 }
                 User.updateOne(
                    { applicationNo: req.params.id },
                    { $set: update }, { runValidators: true },
                    async function (err) {
                        if (err) {
                            res.json({ error_message: err.message, status: "FAILED" });
                        } else {
                            console.log('calling user.assignCoadmin()')
                            await user.assignCoadmin()	// check for error and make this atomic
                            console.log(`user after assigning ${user}`)
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

/*router.post("/send_pdf/:id", verifyToken,upload2.single("filePreview"), (req, res) => {
   
    User.findOne({ applicationNo: req.params.id }, function (err, user) {
        if (!err) {
            console.log(`cwd = ${process.cwd()}, req.file.path = ${req.file.path}`)
            var pathToAttachment = path.join(process.cwd(), req.file.path);
            //var pathToAttachment = 'https://drive.google.com/file/d/1ekHNlkBpfYTW9DgWVYVZI-FI4tNw7Yil/view?usp=share_link';
            console.log(pathToAttachment);
            
            var attachment = fs.readFileSync(pathToAttachment).toString("base64");
            const msg = {
                to: [
                    {
                        "email": "19cs022@mgits.ac.in"
                    },
                    {
                        "email":"19cs208@mgits.ac.in",
                    }
                    ], // Change to your recipient
                from: 'ams.mits23@gmail.com', 
                subject: 'Application Received',
                text: `Hi ${user.firstName},\nWe have received your application of admission for ${user.course} ${user.quota} ${user.academicYear} batch at Muthoot Institute of Technology and Science\nYour application number: ${user.applicationNo}\nPlease find attached, the application form you submitted.\n\nTeam MITS`,
                attachments: [
                {
                    content: attachment,
                    filename: "application_form.pdf",
                    type: "application/pdf",
                    disposition: "attachment"
                }]
            };
            sgMail.send(msg).then((response) => {
                console.log(response[0].statusCode)
                console.log(response[0].headers)
                
                    //findRemoveSync(`${__dirname.slice(0,-4)}\public\\files`, {age: {seconds: 3600}});
                     fs.unlinkSync(`${__dirname.slice(0,-4)}\\`+req.file.path);
                     console.log('files removed');
                  
                res.json({
                    status: "SUCCESS ",
                    message:"Mail has been sent to admissions team and the student"
                });
            }) .catch((error) => {
                console.error(error)
                res.json({
                    status: "FAILED",
                    message:"Mail could not be sent"
                });
            })
                
        } else {
            res.json({
                status: 'FAILED',
                message: 'Pdf not mailed'
            })
        }
    });
  });
  */
/* Get applicationNo, branch, and quota from request.
 * Have the user occupy the branch's quota.
 * Return waiting list number (0 if not in waiting list)
 */
router.post('/test_waiting_list/', verifyToken, upload, async function (req, res) {
	const branch_ = req.body.branch
	const quota_  = req.body.quota
	const appNo   = req.body.applicationNo

	console.log(req.body)

	console.log(`finding user ${appNo}`)
	var user = null
	var query = {applicationNo: appNo}
	console.log(query)
	await User.findOne({applicationNo: appNo}, (err, result) => {
		if (err) {
			console.log(`error finding user: ${err}`)
			res.status(500)
			return res.json({
				status: 'FAILED',
				message: `error finding user with applicationNo ${appNo}\n${err.message}`
			})
		}
		user = result
	})
	console.log(user)
	if (user == null) {
		console.log(`invalid user: ${appNo}`)
		res.status(400)
		return res.json({
			status: 'FAILED',
			message: 'invalid user'
		})
	}


	console.log(`finding branch ${branch_}`)
	await Branch.findOne({branch: branch_}, async (err, branch) => {
		if (err) {
			console.log(`error finding branch: ${err.message}`)
			res.status(500)
			return res.json({
				status: 'FAILED',
				message: err.message
			})
		}
		/* found branch; now occupy quota's seat */
		var waitingNo = 0
		switch (quota_) {
			case 'NRI':
				console.log('NRI')
				console.log(user)
				waitingNo = branch.occupySeatNRI(user)
				break
			case 'Management':
				console.log('Management')
				console.log(user)
				waitingNo = branch.occupySeatMgmt(user)
				break
			default:
				console.log('invalid quota')
				waitingNo = -1
		}
		if (waitingNo == -1) {
			res.status(400)
			return res.json({
				status: 'FAILED',
				message: 'Invalid quota'
			})
		}
		/* set user's waiting status */
		user.waiting = waitingNo > 0 ? true : false
		try {
			await user.save()
		} catch (err) {
			console.log(`error saving user: ${err.message}`)
			res.status(500)
			return res.json({
				status: 'FAILED',
				message: `error saving user\n${err.message}`
			})
		}
		res.status(200)
		return res.json({
			status: 'SUCCESS',
			message: `${appNo} occupied ${quota_}.\n`,
			waitingListNo: waitingNo
		})
	})
})

module.exports = router

