/**
 * Created by katsanva on 05.10.2014.
 */

var express = require('express'),
    async = require('async'),
    fs = require('fs'),
    _ = require('underscore'),
    PDFDocument = require('pdfkit'),
    mailer = require('nodemailer').createTransport(),
    config = require(process.cwd() + '/config.json'),
    router = new express.Router();

var models = require('../models/');


var getPrice = function(price, amount, promoCode) {
    var discount = promoCode ? ( promoCode / 100) : 1,
        fractal = price.fractional * discount,
        integral = price.integral * discount + Math.floor(fractal / 100),
        priceOne;

    fractal = fractal % 100;
    priceOne = integral + '.' + fractal % 100;

    return {
        one: priceOne,
        total: '' + (integral * amount) + '.' + fractal * amount
    };
};

module.exports = router;

var sendResponse = function(res, err, result) {
    if (err) {
        return res.status(err.code || 500).json(err).end();
    }

    res.json(result).end();
};

router.post('/', function(req, res) {
    var amount = parseInt(req.body.amount, 10) || 1,
        promoCode = req.body.promo,
        identities = req.body.identity || [];

    identities = _.filter(identities.slice(0, amount), function(identity) {
        return !!identity.name && !!identity.surname;
    });

    if (!identities) {
        sendResponse(res, new Error('Missing names'))
    }

    async.waterfall([
        function(callback) {
            models.Event.findOne({}, callback);
        },
        function(event, callback) {
            if (!event) {
                callback({code: 404, message: "Not found an event"})
            }

            var price = getPrice(event.price, amount, event.promocodes[promoCode]);

            var data = {
                eventId: event._id,
                promocode: promoCode,
                total: price.total
            };

            var order = new models.Order(data);

            order.save(function(err, order) {
                callback(err, order, price);
            });
        },
        function(order, price, callback) {
            async.map(identities, function(identity, callback) {
                var data = {
                    firstName: identity.name,
                    lastName: identity.surname,
                    price: price.one,
                    eventId: order.eventId,
                    orderId: order._id
                };

                var ticket = new models.Ticket(data);

                ticket.save(callback);
            }, function(err, tickets) {
                callback(err, order, tickets)
            });
        },
        function(order, tickets, callback) {
            order.tickets = [];

            _.each(tickets, function(ticket) {
                order.tickets.push(ticket._id);
            });

            order.save(callback);
        }
    ], function(err, order) {
        sendResponse(res, err, {order: order})
    });
});

router.get('/order/:orderId', function(req, res) {
    sendResponse(res);
});

router.post('/order/:orderId', function(req, res) {
    var email = req.body.email,
        cardId = req.body['card-id'];

    async.waterfall([
            function(callback) {
                if (!cardId) {
                    return callback(new Error('Bad payment data'))
                }


                models.Order.findByIdAndUpdate(req.params.orderId,
                    {
                        $set: {
                            checkout: true,
                            email: email,
                            card: cardId
                        }
                    }, callback);
            },
            function(order, callback) {
                async.waterfall([
                    function(callback) {
                        models.Event.findOne({}, callback)
                    },
                    function(event, callback) {
                        async.each(order.tickets, function(ticket) {
                            var doc = new PDFDocument();
                            doc.pipe(fs.createWriteStream('ticket.pdf'));

                            doc.fontSize(25)
                                .text('Event ' + event.name, 100, 100)
                                .text('Time ' + event.date, 100, 150)
                                .text('Ticket ID ' + ticket._id, 150, 100)
                                .text('Ticked owned by ' + ticket.firstName + ' ' + ticket.lastName, 100, 200);

                            doc.end();

                            fs.readFile(
                                "ticket.pdf",
                                function(err, data) {
                                    mailer.sendMail(
                                        {
                                            sender: 'sender@sender.com',
                                            to: order.email,
                                            subject: 'Success!',
                                            body: 'You have successfully bought a ticket',
                                            attachments: [{'filename': 'ticket.pdf', 'contents': data}]

                                        }, callback)
                                },
                                callback);
                        }, callback)
                    }
                ], callback)
            }],

        function(err, result) {
            sendResponse(res, err, result);
        }
    );
});


