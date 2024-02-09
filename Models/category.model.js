let mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let categorySchema = new mongoose.Schema({
    categoryName : {
        type : String,
        require : true
    },
    createBy: {
        type: mongoose.Types.ObjectId,
        default : null
    }
},{timestamps : true, strictQuery : false, autoIndex : true});
categorySchema.plugin(mongoosePaginate);
module.exports = categorySchema;