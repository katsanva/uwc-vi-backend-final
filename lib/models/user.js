/**
 * Created by katsanva on 22.11.2014.
 */
var mongoose = require('mongoose');

var schema = mongoose.Schema({
    login: String,
    password: String
});

var Model = mongoose.model('User', schema);

module.exports = Model;