let mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let reviewSchema = new mongoose.Schema({
    productId : {
        type : mongoose.Types.ObjectId,
        default : null
    },
    rating : {
        type : String,
        require : true
    },
    review : {
        type : String,
        require : true
    },
    createBy : {
        type : mongoose.Types.ObjectId,
        default : null
    },
    createdAtTimestamp : {
        type : Number,
        require : true
    }
},{timestamps : true, strict : false, autoIndex : true});
reviewSchema.plugin(mongoosePaginate);
module.exports = reviewSchema;