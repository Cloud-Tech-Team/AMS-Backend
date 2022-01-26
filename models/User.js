const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema

const UserSchema = new Schema({
      applicationNo:{
        type:String
      },
      course:{
        type:String,
        enum:{
          values:['MTech','BTech'],
          message:"Invalid course"
        },
      },
      quota:{
        enum:{
          values:['Management','Government','NRI'],//TODO
          message:"Invalid quota"
        },
        type:String
      },
      firstName:
        {
          type: String
        },
      middleName: String,
      lastName:
        {
          type: String,
          // required:['This field is required']
        },
      email:
        {
          type: String,
          validate:{
            validator: value=> /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
          },
        },
      age :
      {
        type:Number,
        min:16,
        max:90,
      },
      aadhaar:
      {
        type: Number,
        validate: {
            validator:value=>/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/.test(value),
            message:"Invalid Aadhar Number"
        },
      },
      countryCode:{
        type:String,
        default: '+91',

      },
      phone:
      {
        type:Number,
        validate:{
            validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
            message:"Invalid Mobile Number"
        },
      },
      aPhone:
      {
        type:Number,
        validate:{
            validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
            message:"Invalid Mobile Number"
        }
      },
      dob:       Date,
      gender:
      {
        enum: {
            values: ['Male', 'Female','Others'],
            message:'Invalid Gender'
          },
        type:String
      },

      password:
      {
          type: String,
      },
      nationality:String,
      motherTongue:String,
      bloodGroup:
      {
        type:String,
        enum:{
            values:['O+','O-','A+','A-','B+','B-','AB+','AB-'],
            message:"Invalid Blood group"
        }
      },
      contactAddress:{
        addressL1:String,
        district:String,
        city:String,
        state:String,
        pincode:{
            type:Number,
            validate:{
                validator:value=>/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(value),
                message:'Invalid pincode'
            }
        }

      },
      permanentAddress:{
        addressL1:String,
        district:String,
        city:String,
        state:String,
        pincode:{
            type:Number,
            validate:{
                validator:value=>/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(value),
                message:'Invalid pincode'
            }
        }

      },
      fatherDetails: {
        name:String,
        occupation:String,
        mobile:{
            type:Number,
            validate:{
                validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
                message:"Invalid Mobile Number"
            }
        },
        email:{
            type: String,
            validate:{
              validator: value=> /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
              message:"Invalid Email"
            },
          }
      },
      motherDetails: {
        name:String,
        occupation:String,
        mobile:{
            type:Number,
            validate:{
                validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
                message:"Invalid Mobile Number"
            }
        },
        email:{
            type: String,
            validate:{
              validator: value=> /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
              message:"Invalid Email"
            },
          }
      },
      guardianDetails:{
        name:String,
        relation:String,
        mobile:{
            type:Number,
            validate:{
                validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
                message:"Invalid Mobile Number"
            }
        },
        email:{
            type: String,
            validate:{
              validator: value=> /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
              message:"Invalid Email"
            },
          }
      },
      annualIncome:
      {
        type:Number,
      },
      NRIdetails: {
        name:String,
        relation:String
      },
      bp1:
      {
        enum: {
            values: ['CSE', 'ECE','EEE','CE','ME',null],
            message:'Invalid Branch'
      },
      type:String
      },
      bp2:
      {
          enum: {
              values: ['CSE', 'ECE','EEE','CE','ME'],
              message:'Invalid Branch'
        },
        type:String
      },
      bp3:
      {
          enum: {
              values: ['CSE', 'ECE','EEE','CE','ME'],
              message:'Invalid Branch'
        },
        type:String
      },
      bp4:
      {
          enum: {
              values: ['CSE', 'ECE','EEE','CE','ME'],
              message:'Invalid Branch'
        },
        type:String
      },
      bp5:
      {
          enum: {
              values: ['CSE', 'ECE','EEE','CE','ME'],
              message:'Invalid Branch'
        },
        type:String
      },
      busFacility:{
        type:Boolean
      },
      hostelFacility:{
        type:Boolean
      },
      academicDetails:{
        qualifyingExam:String,
        phyMarkObtained:Number,
        phyMaxMarks:Number,
        chemMarkObtained:Number,
        chemMaxMarks:Number,
        mathsMarkObtained:Number,
        mathsMaxMarks:Number
      },
      filePhotograph:{
        type:String
      },
      imgSign:{
        type:String
      },
      fileTransactionID:{
        type:String
      },

      registrationTimeStamp : {
        type:Date,
        default: Date.now()
      },
      academicYear:{
        type:String
      },
      transactionID:{
        type:String
      }

});

UserSchema.methods.generateApplicationNo = function(number) {
  quota=this.quota.toString().toUpperCase()[0];
  course=this.course.toString().toUpperCase().slice(0,2);
  month=this.registrationTimeStamp.getMonth();
  year = this.registrationTimeStamp.getFullYear().toString().slice(2,);
  if(month > 9)
    year++;
  this.academicYear=year;
  applicationNo=(year*10000)+Number(number);
  this.applicationNo=quota+course+applicationNo;

}

UserSchema.methods.generatePassword = function(number) {
  dob=this.dob;
  date = dob.getDate().toString().padStart(2, '0');	// Pad with zeroes to make it atleast 2 digits
  month = (dob.getMonth()+1).toString().padStart(2, '0');
  year = dob.getFullYear().toString().slice(2,);
  applicationNo = year[0] + (Number(year[1])*10000 + number)

  password=date+month+applicationNo;
  return password;
}

UserSchema.methods.comparePassword = function(password) {
	return password == this.password;		// storing plaintext password. rip
}

UserSchema.methods.generateJWT = function() {
	let payload = {
		id:	this._id,
		email:	this.email
	};

	return jwt.sign(payload, 'secret_key', {
		expiresIn: '24h'
	});
}

const User = mongoose.model('NRI', UserSchema)
module.exports = User


// course
// fname
// mName
// lName
// age
// aadhaar
// phone
// aPhone
// dob
// gender
// password
// nationality
// motherTongue
// bloodGroup
// addressL1C
// addressL2C
// cityC
// stateC
// pincodeC
// addressL1P
// addressL2P
// cityP
// stateP
// pincodeP
// fatherName
// fatherOccupation
// fatherMobile
// fatherEmail
// motherName
// motherOccupation
// motherMobile
// motherEmail
// guardianName
// guardianRelation
// guardianMobile
// guardianEmail
// annualIncome
// NRIname
// NRIrelation
// bp1
// bp2
// bp3
// bp4
// bp5
// busFacility
// hostelFacility
// qualifyingExam
// phyMarkObtained
// phyMaxMarks
// chemMarkObtained
// chemMaxMarks
// mathsMarkObtained
// mathsMaxMarks
// imgPhotograph
// imgSign
// quota
// countryCode
