// mongodb
require('./config/db')
const express=require('express')
const app = express()
const port = process.env.PORT || 3000
const path = require('path');

//cors policy
const cors=require('cors');

//var options = {
//    "origin": "*",
//    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//    // "preflightContinue": false,
//    // "optionsSuccessStatus": 204
//  }

app.use(cors());
// app.options('*',cors());

const bodyParser = require('body-parser')
const UserRouter = require('./api/User')
const AdminRouter = require('./api/Admin')
const BranchRouter = require('./api/Branch')


app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
// To parse json
app.use(express.json())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// For accepting post form data

app.use('/user', UserRouter)
app.use('/branch', BranchRouter)
app.use('/admin', AdminRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
