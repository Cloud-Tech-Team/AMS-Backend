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
    let { quota, firstName, middleName, lastName, email, age, aadhaar, phone, dob, gender, password } = req.body;
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

    if (firstName == "" || lastName == "" || email == "" || dob == "" || gender == "" || quota == "") {
		res.status(204);	// 204 No content
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
        console.log(req.body)
    }
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
		res.status(400);
        res.json({
            status: "FAILED",
            message: "Invalid email"
        })
    }
    else {
		var query = {email: email, quota: quota, course: req.body.course}
		const stu = await User.findOne(query)
		if (stu) {
			console.log(`error: student exists ${stu}`)
			res.status(409)
			return res.json({
				status: 'FAILED',
				message: `User has already registered for ${quota} and ${req.body.course}`
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
			firstName: req.body.firstName,
			middleName: req.body.middleName,
			lastName: req.body.lastName,
			email: req.body.email,
			age: req.body.age,
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
		console.log('calling user.assignCoadmin()')
		await user.assignCoadmin()	// check for error and make this atomic
		console.log(`user after assigning ${user}`)
		user.save(function (err) {
			if (err) {
				console.log('error saving user');
				res.status(500);
				res.json({status: "FAILED"});
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
						res.status(204);	// 204 No Content
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
                    application:user.applicationNo,
                    dob:user.dob,
                    firstName:user.firstName,
                    middleName:user.middleName,
                    lastName:user.lastName,
                    permanentAddress:user.permanentAddress,
                    dob:user.dob,
                    phone:user.phone,
                    aPhone:user.aPhone,
                    email:user.email,
                    sponserName:user.NRIdetails.name,
                    sponserRelation:user.NRIdetails.relation,
                    guardianName:user.guardianDetails.name,
                    guardianOccupation:user.guardianDetails.occupation,
                    gruardianRelation:user.guardianDetails.relation,
                    selectedBranch:user.bp1,
                    transactionID:user.transactionID
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
                
                    if(req.files.fileTransactionID){
                        const file64 = formatBufferTo64(req.files.fileTransactionID[0]);
                        const uploadResult = await cloudinaryUpload(file64.content);
                        req.body.fileTransactionID = uploadResult.secure_url;
                        if(req.body.fileTransactionID!=null)
                            console.log('Transaction File uploaded\n')
                    }
                }
    
                if(req.body.bp1 && users.bp1==null && users.quota==NRI){
                    console.log('-----')
                    Branch.findOne({branch:req.body.bp1},function(err,branch){
                        if(branch)
                        {
                            if(!branch.checkFilled() && !branch.checkFilledNRI()){
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
                            // console.log(branch.checkFilled());
                        }
                    })
                }
    
                body=req.body;
                // console.log(body);
                const address={
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
    
    
    
                var update=Object.assign({},body,address,guardian,sponser);
    
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








module.exports = router

