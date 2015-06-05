var Pusher = require('pusher-client');
var num = require('num');
var config = require('config');

/**
 * Wraps the Bitstamp Order Book API and passes the provided callback
 * a plain js object of the top of the book
 * @constructor
 */
var BitstampOrderBook = function(){
    var exchangeId = config.get('Exchange.Coinbase.id');
    if(config.get('Exchange.Coinbase.use_live_orderbook')) {
        /**
         * Subscribe to the bitstamp order book api
         * @param {function} callback
         */
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
                    },
                    exchangeId: exchangeId
                });
            });
        };
    } else {
        /**
         * Fake some orderbook top data
         * @param callback
         */
        this.subscribe = function(callback) {
            setInterval(function(){
                var bid = (1.0-Math.random())*250;
                var ask = bid - 1;
                // make sure the ask is realistic
                while(ask < bid) {
                    ask = bid*(1.0+Math.random());
                }
                return callback({
                    bid:{
                        price: num(bid),
                        amount: num(Math.random()*10)
                    },
                    ask:{
                        price: num(ask),
                        amount: num(Math.random()*10)
                    },
                    exchangeId: exchangeId
                })
            },1000);
        };
    }

    this.getExchangeId = function(){return exchangeId;};
};

module.exports = exports = BitstampOrderBook;