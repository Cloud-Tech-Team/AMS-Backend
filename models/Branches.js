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
    filled:{
        type:Boolean,
        default:false
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

BranchSchema.methods.occupySeat=function(){
    this.occupiedSeats++;
    if(this.occupiedSeats==this.totalSeats)
        this.filled=true;
};
BranchSchema.methods.checkFilled=function(){
    return this.filled;
}


BranchSchema.methods.occupySeatNRI=function(){
    this.occupiedSeatsNRI++;
    if(this.occupiedSeatsNRI==this.NRISeats)
        this.filledNRI=true;
};

BranchSchema.methods.checkFilledNRI=function(){
    return this.filledNRI;
}

BranchSchema.methods.waitingListNumberNRI=function(){
    this.waitingListNRI++;
    return this.waitingListNRI;
}

const Branch = mongoose.model('branch', BranchSchema)
module.exports = Branch
