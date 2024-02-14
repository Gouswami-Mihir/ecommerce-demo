let mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let variantSchema = new mongoose.Schema({
    variantId : {
        type : mongoose.Types.ObjectId,
        default : null
    }
},{_id : false});
let cartSchema = new mongoose.Schema({
    cartItem : [variantSchema],
    createBy : {
        type : mongoose.Types.ObjectId,
        default : null
    }
},{timestamps : true, strict : false, autoIndex : true});
cartSchema.plugin(mongoosePaginate);
module.exports = cartSchema;