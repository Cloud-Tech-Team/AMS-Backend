const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const branches=['CSE', 'ECE','EEE','CE','ME'];

const BranchSchema=new Schema({
    branch:{
        type:String,
        enum:branches,
      },
    totalSeats:Number,
    occupiedSeats:{
        type:Number,
        default:0
    },
    waitingList:{
        type:Number,
        default:0
    },
    filled:{
        type:Boolean,
        default:false
    }
});

BranchSchema.methods.occupySeat=function(){
    this.occupiedSeats++;
    if(this.occupiedSeats==this.totalSeats)
        this.filled=true;
};

BranchSchema.methods.checkFilled=function(){
    return this.filled;
}

BranchSchema.methods.waitingListNumber=function(){
    this.waitingList++;
    return this.waitingList;
}

const Branch = mongoose.model('branch', BranchSchema)
module.exports = Branch