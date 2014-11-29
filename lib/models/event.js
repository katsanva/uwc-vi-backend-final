/**
 * Created by katsanva on 22.11.2014.
 */
var mongoose = require('mongoose');

var schema = mongoose.Schema({
    name: String,
    date: {type: Date, default: Date.now},
    price: {
        integral: Number,
        fractional: Number
    },
    promocodes: []
});

var Model = mongoose.model('Event', schema);

module.exports = Model;