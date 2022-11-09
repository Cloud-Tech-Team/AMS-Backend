const AdminDB = require('./models/Admin')
const User = require('./models/User')

require('dotenv').config()

const mongoose = require('mongoose')

async function connectDB() {
	mongoose.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}).then(() => {
		console.log("DB Connected")
	}).catch((err) => console.log(err))
}


async function main() {
	await connectDB()
	console.log('DB connected')

	const admin = new AdminDB({
		name: "admin",
		role: "admin",
		email: "ams.mits23@gmail.com",
		password: "adminnn"
	})

	admin.save((err) => {
		if (err) {
			console.log('error saving co-admin')
		} else {
			console.log('saved co-admin successfully')
		}
	})
}

main()
