const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BranchSchema=new Schema({
    branch:{
        type:String,
    },
	/* total seats must be sum of seats for all quotas */
    totalSeats:Number,
	/* maybe make this all configurable as an array  of objects */
    NRISeats:Number,
    MgmtSeats:Number,
	/* total occupied seats - incremented when any seat is occupied */
    occupiedSeats:{
        type:Number,
        default:0
    },
	/* occupied seats for each quota - add PIOC, WICGYHKUH */
    occupiedSeatsNRI:{
        type:Number,
        default:0
    },
	occupiedSeatsMgmt: {
		type: Number,
		default: 0
	},
	/*
	 * array of application numbers in waiting list in order
	 * remove when user is deleted
	 */
    waitingListNRI: {
        type: [String],
		default: []
    },
    waitingListMgmt: {
        type: [String],
        default: []
    },
    filledNRI:{
        type:Boolean,
        default:false
    }
});

BranchSchema.methods.isFilled = function() {
	return this.occupiedSeats == this.totalSeats
}

/*
 * Occupy seat for each quota.
 * Add to waiting list if all seats filled and return waitingList number if successful,
 * else return -1.
 * To get a user's waiting list number, check their 'waiting' field.
 * If true, find their index in waitingListXXX array using applicationNo.
 * NOTE: If user is already in waitingList, *PRETEND* to add and return index.
 * What if user who registered, but not in waiting list applies again?
 */
BranchSchema.methods.occupySeatNRI = async function(user) {
	console.log(`occupySeatNRI: ${user.applicationNo}`)
	if (!this.isNRIFilled()) {
		console.log('not filled')
		this.occupiedSeatsNRI++;
		this.occupiedSeats++;
		this.save()
		return 0
	} else {
		/* add user to waitingList if not already in it */
		var index = this.waitinglistNRI.indexOf(user.applicationNo)
		if (index != -1) {
			console.log(`${user.applicationNo} already in waiting list @ ${index}`)
		} else {
			this.waitingListNRI.push(user.applicationNo)
			index = this.waitingListNRI.length
			await this.save(function (err) {
				console.log(`error saving branch: ${err.message}`)
				return -1
			})
		}
		console.log('waiting list')
		console.log(this.waitingListNRI)
		return index
	}
};

BranchSchema.methods.occupySeatMgmt = async function(user) {
	console.log(`occupySeatMgmt: ${user.applicationNo}`)
	console.log(`occupied: ${this.occupiedSeatsMgmt}, total: ${this.MgmtSeats}`)
	if (!this.isMgmtFilled()) {
		console.log('not filled')
		this.occupiedSeatsMgmt++;
		this.occupiedSeats++;
		this.save()
		return 0
	} else {
		/* add user to waitingList if not already in it*/
		var index = this.waitingListMgmt.indexOf(user.applicationNo)
		if (index != -1) {
			console.log(`${user.applicationNo} already in waiting list @ ${index}`)
		} else {
			this.waitingListMgmt.push(user.applicationNo)
			await this.save(function (err) {
				console.log(`error saving branch: ${err.message}`)
				return -1
			})
			index = this.waitingListNRI.length
		}
		console.log('waiting list')
		console.log(this.waitingListMgmt)
		return index
	}
};

/*
 * Get waiting list number for given user
 */
BranchSchema.methods.getNRIWaitingListNo = function(user) {
	// if not in array, indexOf returns -1, so we return 0.
	console.log(`getNRIWaitingListNo ${user.applicationNo}`)
	return this.waitingListNRI.indexOf(user.applicationNo) + 1
}

BranchSchema.methods.getMgmtWaitingListNo = function(user) {
	console.log(`getMgmtWaitingListNo ${user.applicationNo}`)
	return this.waitingListMgmt.indexOf(user.applicationNo) + 1
}

/*
 * Seat becomes free when user is removed - update waiting list accordingly.
 * NOTE: This does not remove user from UserDB.
 * Depends on whether the user being removed is in waiting list or not:
 * 	in waiting list:
 * 		Simply remove user from waiting list.
 * 		Return null
 * 	not in waiting list:
 * 		This means we can move the first person in the waiting list out of it
 * 		and set their waiting status to false.
 * 		We return this user's application number from this function so whoever
 * 		called us can set the user's waiting status to false.
 */
BranchSchema.methods.freeSeatNRI = function(user) {
	console.log('freeSeatNRI')
	if (user.waiting) {
		console.log('user being removed from waiting list')
		index = this.waitingListNRI.indexOf(user.applicationNo)
		this.waitingListNRI.splice(index, 1)	// remove
		return null
	} else {
		// move first person in waiting list out of it
		var u = this.waitingListNRI.shift()
		console.log(`user ${u} moved out of waiting list`)
		return u
	}
}

BranchSchema.methods.freeSeatMgmt = function(user) {
	console.log('freeSeatMgmt')
	if (user.waiting) {
		console.log('user being removed from waiting list')
		index = this.waitingListMgmt.indexOf(user.applicationNo)
		this.waitingListMgmt.splice(index, 1)	// remove
		return null
	} else {
		// move first person in waiting list out of it
		var u = this.waitingListMgmt.shift()
		console.log(`user ${u} moved out of waiting list`)
		return u
	}
}

/* Check if quota is filled */
BranchSchema.methods.isNRIFilled = function() {
    return this.occupiedSeatsNRI == this.NRISeats
}

BranchSchema.methods.isMgmtFilled = function() {
    return this.occupiedSeatsMgmt == this.MgmtSeats
}

/* Get waiting list number for each quota by returning number of people in waitingList + 1 */
BranchSchema.methods.NRIWaitingListSize = function() {
	return this.waitingListNRI.length + 1
}

BranchSchema.methods.MgmtWaitingListSize = function() {
	return this.waitingListMgmt.length + 1
}

const Branch = mongoose.model('branch', BranchSchema)
module.exports = Branch
