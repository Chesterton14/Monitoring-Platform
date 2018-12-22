var  mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/test');

var mySchema = new Schema({
    username: String,
    pwd: String
});

module.exports = mongoose.model('user', mySchema);

