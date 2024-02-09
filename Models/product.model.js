let mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let productSchema = new mongoose.Schema({
    productName : {
        type : String,
        require : true
    },
    description : {
        type : String,
        require : true
    },
    createBy: {
        type: mongoose.Types.ObjectId,
        default : null
    },
    createdAtTimestamps : {
        type : Number,
        require : true
    },
    updateAtTimestamps : {
        type : Number,
        require : true
    }
},{timestamps : true, strictQuery : false, autoIndex : true});
productSchema.plugin(mongoosePaginate);
module.exports = productSchema;