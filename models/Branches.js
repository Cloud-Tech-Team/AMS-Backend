const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BranchSchema=new Schema({
    branch:{
        type:String,
    },

    totalSeats:Number,
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
	/* array of application numbers in waiting list in order */
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

BranchSchema.methods.occupySeat = function() {
	if (!this.isFilled())
		this.occupiedSeats++;
};

BranchSchema.methods.isFilled = function() {
	return this.occupiedSeats == this.totalSeats
}


BranchSchema.methods.occupySeatNRI = function() {
	if (!this.isNRIFilled())
		this.occupiedSeatsNRI++;
	/* add user to waitingListNRI array */
};

BranchSchema.methods.isNRIFilled = function() {
    return this.occupiedSeatsNRI == this.NRISeats
}

BranchSchema.methods.waitingListNumberNRI=function(){
    this.waitingListNRI++;
    return this.waitingListNRI;
}

const Branch = mongoose.model('branch', BranchSchema)
module.exports = Branch
