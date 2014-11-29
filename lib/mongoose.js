/**
 * Created by katsanva on 22.11.2014.
 */

var mongoose = require('mongoose'),
    config = require(process.cwd() + '/config.json').db || {
            host: 'localhost',
            database: 'uwc-vi-final'
        };


mongoose.connect('mongodb://' + config.host + '/' + config.database);

module.exports = mongoose;