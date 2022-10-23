const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema

const AdminSchema = new Schema({
	role: {
		type: String,
		enum: ['admin', 'co-admin'],
		default: 'co-admin'
	},
	firstName: {
		type: String,
		required: true
	},
	middleName: {
		type: String
	},
	lastName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		validate: {
			validator: value=> /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(value)
		}	// change to accept only mgits.ac.in domain maybe...
	},
	password: {
		type: String,
		required: true
	}
})

AdminSchema.methods.comparePassword = function comparePassword(password) {
	console.log(`entered password: '${password}'`)
	console.log(`actual password:  '${this}'`)
	console.log(this)
	return password == this.password	// TODO: hash it... maybe
}

AdminSchema.methods.generateJWT = function generateJWT() {
	let payload = {
		id: this._id,
		email: this.email,
		role: this.role
	}
	return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
		expiresIn: '24h'
	})
}

const AdminDB = mongoose.model('Admin', AdminSchema)
module.exports = AdminDB
