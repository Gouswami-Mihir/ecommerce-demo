var mongoose = require('mongoose');
var MongoDB = mongoose.createConnection(process.env.MONGO_URI);
module.exports = MongoDB;

