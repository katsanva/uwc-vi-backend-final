/**
 * Created by katsanva on 22.11.2014.
 */
var mongoose = require('mongoose');

var schema = mongoose.Schema({
    email: String,
    updated: {type: Date, default: Date.now},
    eventId: mongoose.Schema.Types.ObjectId,
    checkout: {type: Boolean, default: false},
    promocodes: [],
    tickets: [mongoose.Schema.Types.ObjectId],
    total: String,
    card: String,
    email: String
});

var Model = mongoose.model('Order', schema);

module.exports = Model;