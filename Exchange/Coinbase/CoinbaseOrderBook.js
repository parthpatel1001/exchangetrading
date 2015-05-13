/**
 * Created by parthpatel1001 on 5/9/15.
 */
var CoinbaseExchange = require('coinbase-exchange');
var num = require('num');

var CoinbaseOrderBook = function(name) {
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
                }
            });
            //console.log('----------------------------');
            //console.log(bidAmnt.toString()+' @ '+bidPrice.toString()+' ||| '+askAmnt.toString()+' @ '+askPrice.toString());
            //console.log('----------------------------');
        });
    };
};

module.exports = exports = CoinbaseOrderBook;