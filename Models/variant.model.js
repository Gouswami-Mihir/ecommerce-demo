let mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let variantSchema = new mongoose.Schema({
    variantname : {
        type : String,
        require : true
    },
    categoryId : {
        type : mongoose.Types.ObjectId,
        default : null
    },
    productId : {
        type : mongoose.Types.ObjectId,
        default : null
    },
    specification : {
        type : String,
        require : true
    },
    price : {
        type : Number,
        require : true
    },
    discountper : {
        type : String,
        require : true
    },
    totalDiscount : {
        type : String,
        require : true
    },
    grossAmount : {
        type : String,
        require : true
    },
    stock : {
        type : Number,
        require : true
    },
    createBy : {
        type : mongoose.Types.ObjectId,
        default : null
    }
},{timestamps : true, strictQuery : false, autoIndex : true});
variantSchema.plugin(mongoosePaginate);
module.exports = variantSchema;
