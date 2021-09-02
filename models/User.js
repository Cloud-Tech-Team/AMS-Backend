const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date
})
const UsersSchema = new Schema ({

      first_name:  String,
      middle_name: String,
      email:       String,
      age :    {
        type:Number,
        min:16,
        max:90,
      },
      aadhaar:   String,
      phone:     String,
      dob:       Date,
      gender:  String,
      password:{
          type: String,
          required:['This field is required']
      }
});

const User = mongoose.model('User', UserSchema)
module.exports = User
