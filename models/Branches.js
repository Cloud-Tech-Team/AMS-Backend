const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BranchSchema=new Schema({
    branch:{
        type:String,
      },
    totalSeats:Number,
    NRISeats:Number,
    MSeats:Number,
    GSeats:Number,
	
    occupiedSeats:{
        type:Number,
        default:0
    },
    occupiedSeatsNRI:{
        type:Number,
        default:0
    },
    waitingListNRI:{
        type:Number,
        default:0
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
