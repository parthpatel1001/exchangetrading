/**
 * Created by parthpatel1001 on 5/14/15.
 */

var
    Redis = require("redis"),
    CoinbaseOrderBook = require('../lib/Exchange/Coinbase/CoinbaseOrderBook.js'),
    BitstampOrderBook = require('../lib/Exchange/Bitstamp/BitstampOrderBook.js'),
    OrderBookManager  = require('../lib/OrderBook/OrderBookManager.js'),
    OrderBookPusher  = require('../lib/OrderBook/OrderBookPusher.js');

console.log('Starting OrderBookPusher');

new OrderBookPusher(
    // TODO make this safer by making an exchangeOBHolder
    // has to be same order as exchange manager
    new OrderBookManager()
        .addOrderBook(new CoinbaseOrderBook())
        .addOrderBook(new BitstampOrderBook()),
    Redis  // TODO add redis config here
)
// TODO make this a config
.subscribeOrderBookToRedis('ORDER_BOOK_TOP','ORDER_BOOK_TICK');

console.log('Pushing orderbook ticks');
