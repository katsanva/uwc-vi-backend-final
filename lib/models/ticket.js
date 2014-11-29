/**
 * Created by katsanva on 22.11.2014.
 */
var mongoose = require('mongoose');

var schema = mongoose.Schema({
    firstName: String,
    lastName: String,
    price: String,
    created: { type: Date, default: Date.now },
    eventId: mongoose.Schema.Types.ObjectId,
    orderId: mongoose.Schema.Types.ObjectId,
    checkout: {type: Boolean, default: false}
});

var Model = mongoose.model('Ticket', schema);

module.exports = Model;