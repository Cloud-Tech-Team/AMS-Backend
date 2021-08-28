const express = require('express')
const router = express.Router()

// mongodb user model
const User = require('./../models/User')

const bcrypt = require('bcrypt')


router.post('/signup', (req, res) => {
    let { name, email, password, dateOfBirth } = req.body
    console.log(req.body)
    name = name.trim()
    email = email.trim()
    dateOfBirth = dateOfBirth.trim()

    if (name == "" || email == "" || password == "" || dateOfBirth == "") {
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
    } else if (!new Date(dateOfBirth).getTime()) {
        res.json({
            status: "FAILED",
            message: "Invalid date of birth"
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
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth
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
})

router.post('/signin', (req, res) => {
    let { email, password } = req.body;
    console.log(req.body)

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials entered"
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
})

module.exports = router
