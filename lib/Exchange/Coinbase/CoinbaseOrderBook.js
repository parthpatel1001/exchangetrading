var CoinbaseExchange = require('coinbase-exchange');
var num = require('num');
var config = require('config');

/**
 * Wraps the Coinbase Order Book API and passes the provided callback
 * a plain js obect of the top of the orderbook
 * @constructor
 */
var CoinbaseOrderBook = function() {
    var exchangeId = config.get('Exchange.Bitstamp.id');
    if(config.get('Exchange.Coinbase.use_live_orderbook')) {
        /**
         * subscribe to the Coinbase orderbook api
         * @param callback
         */
        this.subscribe = function(callback){
            var orderbookSync = new CoinbaseExchange.OrderbookSync();
            orderbookSync.subscribe(function(book){
                book = book.state();
                var bid = book.bids[0],
                    ask = book.asks[0];

                return callback({
                    bid: {
                        price: num(bid.price),
                        amount: num(bid.size)
                    },
                    ask : {
                        price: num(ask.price),
                        amount: num(ask.size)
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
            setInterval(function () {
                var bid = (1.0 - Math.random()) * 250;
                var ask = bid - 1;
                // make sure the ask is realistic
                while (ask < bid) {
                    ask = bid * (1.0 + Math.random());
                }
                return callback({
                    bid: {
                        price: num(bid),
                        amount: num(Math.random() * 10)
                    },
                    ask: {
                        price: num(ask),
                        amount: num(Math.random() * 10)
                    },
                    exchangeId: exchangeId
                })
            }, 1000);

        };
    }



    this.getExchangeId = function(){return exchangeId;};
};

module.exports = exports = CoinbaseOrderBook;