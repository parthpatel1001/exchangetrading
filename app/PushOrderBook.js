/**
 * Created by parthpatel1001 on 5/14/15.
 */

var
    Redis = require("redis"),
    CoinbaseOrderBook = require('../lib/Exchange/Coinbase/CoinbaseOrderBook.js'),
    BitstampOrderBook = require('../lib/Exchange/Bitstamp/BitstampOrderBook.js'),
    OrderBookManager  = require('../lib/OrderBook/OrderBookManager.js'),
    OrderBookPusher  = require('../lib/OrderBook/OrderBookPusher.js'),
    config = require('config');


var COINBASE_EXCHANGE_ID = 0;
var BITSTAMP_EXCHANGE_ID = 1;

new OrderBookPusher(
    new OrderBookManager()
        .addOrderBook(new CoinbaseOrderBook(COINBASE_EXCHANGE_ID))
        .addOrderBook(new BitstampOrderBook(BITSTAMP_EXCHANGE_ID)),
    Redis
)
.subscribeOrderBookToRedis(config.get('CacheKeys.ORDER_BOOK_TOP'),config.get('EventChannels.ORDER_BOOK_TICK'));

