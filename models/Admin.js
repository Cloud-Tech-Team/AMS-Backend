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
	name: {
		type: String,
		required: true
	},
	// number of students assigned to this co-admin
	studentsAssigned: {
		type: Number,
		default: 0
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
	},
	disabled: {
		 type:Boolean,
        default:false
	}
})

/* getNextCoadmin:
 * Find the next co-admin to assign the student to.
 * We do this by finding the coadmin who has the least number of students assigned.
 */
AdminSchema.statics.getNextCoadmin = async function() {
	console.log('getNextCoadmin()')
	const data = await this.findOne({role: 'co-admin',disabled:false}).sort('studentsAssigned').limit(1)
	if (data) {
		console.log(`found coadmin ${data}`)
		return data
	} else {
		console.log(`error ${data}`)
		return null
	}
}

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
