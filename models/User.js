const mongoose = require('mongoose')
const Schema = mongoose.Schema




const UserSchema = new Schema({

  firstName:
  {
    type: String,
    required: ['This field is required']
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
    validate: {
      validator: value => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
    },
  },
  age:
  {
    type: Number,
    min: 16,
    max: 90,
  },
  aadhaar:
  {
    type: Number,
    validate: {
      validator: value => /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/.test(value),
      message: "Invalid Aadhar Number"
    },
  },
  phone:
  {
    type: Number,
    validate: {
      validator: value => /^[6-9]{1}[0-9]{9}$/.test(value),
      message: "Invalid Mobile Number"
    },
  },
  aPhone:
  {
    type: Number,
    validate: {
      validator: value => /^[6-9]{1}[0-9]{9}$/.test(value),
      message: "Invalid Mobile Number"
    }
  },
  dob: Date,
  gender:
  {
    enum: {
      values: ['Male', 'Female', 'Others'],
      message: 'Invalid Gender'
    },
    type: String
  },
  password:
  {
    type: String,
    // required:['This field is required']
  },
  nationality: String,
  motherTongue: String,
  bloodGroup:
  {
    type: String,
    enum: {
      values: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      message: "Invalid Blood group"
    }
  },
  contactAddress: {
    addressL1: String,
    addressL2: String,
    city: String,
    state: String,
    pincode: {
      type: Number,
      validate: {
        validator: value => /^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(value),
        message: 'Invalid pincode'
      }
    }

  },
  permanentAddress: {
    addressL1: String,
    addressL2: String,
    city: String,
    state: String,
    pincode: {
      type: Number,
      validate: {
        validator: value => /^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(value),
        message: 'Invalid pincode'
      }
    }

  },
  fatherDetails: {
    name: String,
    occupation: String,
    mobile: {
      type: Number,
      validate: {
        validator: value => /^[6-9]{1}[0-9]{9}$/.test(value),
        message: "Invalid Mobile Number"
      }
    },
    email: {
      type: String,
      validate: {
        validator: value => /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
        message: "Invalid Email"
      },
    }
  },
  motherDetails: {
    name: String,
    occupation: String,
    mobile: {
      type: Number,
      validate: {
        validator: value => /^[6-9]{1}[0-9]{9}$/.test(value),
        message: "Invalid Mobile Number"
      }
    },
    email: {
      type: String,
      validate: {
        validator: value => /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
        message: "Invalid Email"
      },
    }
  },
  guardianDetails: {
    name: String,
    relation: String,
    mobile: {
      type: Number,
      validate: {
        validator: value => /^[6-9]{1}[0-9]{9}$/.test(value),
        message: "Invalid Mobile Number"
      }
    },
    email: {
      type: String,
      validate: {
        validator: value => /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
        message: "Invalid Email"
      },
    }
  },
  annualIncome:
  {
    type: Number,
  },
  NRIdetails: {
    name: String,
    relation: String
  },
  bp1:
  {
    enum: {
      values: ['CSE', 'ECE', 'EEE', 'CE', 'ME', null],
      message: 'Invalid Branch'
    },
    type: String
  },
  bp2:
  {
    enum: {
      values: ['CSE', 'ECE', 'EEE', 'CE', 'ME'],
      message: 'Invalid Branch'
    },
    type: String
  },
  bp3:
  {
    enum: {
      values: ['CSE', 'ECE', 'EEE', 'CE', 'ME'],
      message: 'Invalid Branch'
    },
    type: String
  },
  bp4:
  {
    enum: {
      values: ['CSE', 'ECE', 'EEE', 'CE', 'ME'],
      message: 'Invalid Branch'
    },
    type: String
  },
  bp5:
  {
    enum: {
      values: ['CSE', 'ECE', 'EEE', 'CE', 'ME'],
      message: 'Invalid Branch'
    },
    type: String
  },
  busFacility: {
    type: Boolean
  },
  hostelFacility: {
    type: Boolean
  },
  academicDetails: {
    qualifyingExam: String,
    phyMarkObtained: Number,
    phyMaxMarks: Number,
    chemMarkObtained: Number,
    chemMaxMarks: Number,
    mathsMarkObtained: Number,
    mathsMaxMarks: Number
  },
  imgPhotograph: {
    type: String
  },
  imgSign: {
    type: String
  }
});


const User = mongoose.model('User', UserSchema)
module.exports = User

