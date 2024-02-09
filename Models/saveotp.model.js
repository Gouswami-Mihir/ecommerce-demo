var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    email :{
        type: String,
        require : true
    },
    otp : {
        type : String,
        require : true
    },
      expireAt: { 
      type: Date, 
      default: Date.now,
      index: { expires: '2m' }
    }
},{timestamps: true, strict:false, autoIndex:true});
module.exports = schema;