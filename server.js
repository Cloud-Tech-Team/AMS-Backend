// mongodb
require('./config/db')
const express=require('express')
const app = express()
const port = process.env.PORT || 3000
const path = require('path');

const bodyParser = require('body-parser')
const UserRouter = require('./api/User')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
// To parse json
app.use(express.json())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// For accepting post form data

app.use('/user', UserRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
