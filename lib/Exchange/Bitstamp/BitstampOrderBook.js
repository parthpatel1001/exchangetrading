/**
 * Created by parthpatel1001 on 5/9/15.
 */
var Pusher = require('pusher-client');
var num = require('num');

var BitstampOrderBook = function(name){
    this.subscribe = function(callback) {
        var bitstamp_pusher = new Pusher('de504dc5763aeef9ff52'),
        order_book     = bitstamp_pusher.subscribe('order_book');

        order_book.bind('data',function(orders) {
            return callback({
                bid: {
                    price: num(parseFloat(orders.bids[0][0])),
                    amount: num(parseFloat(orders.bids[0][1]))
                },
                ask : {
                    price: num(parseFloat(orders.asks[0][0])),
                    amount: num(parseFloat(orders.asks[0][1]))
                }
            });
        });
    };
};

module.exports = exports = BitstampOrderBook;