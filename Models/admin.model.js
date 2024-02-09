var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var schema = new mongoose.Schema({
    Name : {
        type: String,
        require : true
    },
    Email : {
        type: String,
        require : true
    },
    PhoneNo : {
        type: String,
        require : true
    },
    Role : {
        type: String,
        enum : ["Admin", "subAdmin"],
        require : true
    },
    Password : {
        type: String,
        require : true
    },
    createBy: {
        type: mongoose.Types.ObjectId,
        default : null
    }

},{timestamps: true, strict: false, autoIndex: true});
schema.plugin(mongoosePaginate);
module.exports = schema;