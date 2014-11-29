/**
 * Created by katsanva on 01.10.2014.
 */

'use strict';

var express = require('express'),
    cookieParser = require('cookie-parser'),
    path = require('path'),
    bodyParser = require('body-parser'),
    config = require('./config.json'),
    adminRouter = require('./lib/routers/admin'),
    mongoose = require('./lib/mongoose'),
    userRouter = require('./lib/routers/user');

var app = express();

app.use(cookieParser())
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, '/public')))
    .use('/admin', adminRouter)
    .use('/', userRouter);

app.set('port', process.env.PORT || config.port || 3001);

mongoose.connection.once('open', function() {
    console.log('Connected to the mongodb');

    var server = app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + server.address().port);
    });
});
