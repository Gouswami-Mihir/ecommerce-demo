let mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let customerSchema = new mongoose.Schema({
    customerId : {
        type : String,
        require : true
    },
    fullname : {
        type : String,
        require : true
    },
    companyname : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : true
    },
    phone : {
        type : String,
        require : true
    },
    country : {
        type : String,
        require : true
    },
    websiteName : {
        type : String,
        require : true
    },
    websiteStatus : {
        type : Boolean,
        default : true
    },
    appStatus : {
        type : Boolean,
        default : true
    },
    password : {
        type : String,
        require : true
    },
    createBy : {
        type : mongoose.Types.ObjectId,
        default : null
    },
},{timestamps : true, strict : false, autoIndex : true});
customerSchema.plugin(mongoosePaginate);
module.exports = customerSchema;