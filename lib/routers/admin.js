/**
 * Created by katsanva on 05.10.2014.
 */

var express = require('express'),
    async = require('async'),
    _ = require('underscore'),
    config = require(process.cwd() + '/config.json'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    models = require('../models'),
    router = new express.Router();

passport.use(new LocalStrategy(
    function(username, password, done) {
        models.User.findOne({login: username}, function(err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }

            // no time to salt!
            if (user.password !== 'admin') {
                return done(null, false, {message: 'Incorrect password.'});
            }

            return done(null, user);
        });
    }
));

module.exports = router;

var sendResponse = function(res, err, result) {
    if (err) {
        return res.status(err.code || 500).json(err).end();
    }

    if (!result) {
        return res.status(404).end();
    }

    res.json(result).end();
};
router.use(passport.initialize());
router.use(passport.session());

router.post('/login', passport.authenticate('local', {
    successRedirect: '/admin/',
    failureRedirect: '/admin/login'
}));

router.get('/login', function(req, res) {
    res.sendFile(process.cwd() + '/public/admin/form.html')
});

router.get('/event', function(req, res) {
    var response = {};
    async.waterfall([
        function(callback) {
            models.Event.findOne({}, callback)
        },
        function(event, callback) {
            response.event = event;

            // no time to aggregate functions
            models.Ticket.find({eventId: event._id}, callback)
        },
        function(tickets, callback) {
            response.tickets = _.groupBy(tickets, 'price');
            callback(null, response)
        }
    ], function(err, response) {
        sendResponse(res, err, response);

    });

});

router.post('/', function(req, res) {
    var price = req.body.price || 0,
        discounts = req.body.discounts || {}

    models.Event.findOneAndUpdate({}, {
        $set: {
            price: price,
            discounts: discounts
        }
    }, function(err, event) {
        sendResponse(res, err, event)
    });
});

