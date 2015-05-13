/**
 * Created by parthpatel1001 on 5/9/15.
 */


var num = require('num'),
    Arbiter = require('./Exchange/Trading/Arbiter.js'),
    Trader  = require('./Exchange/Trading/Trader.js'),
    CoinbaseOrderBook = require('./Exchange/Coinbase/CoinbaseOrderBook.js'),
    CoinbaseExchange  = require('./Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampOrderBook = require('./Exchange/Bitstamp/BitstampOrderBook.js'),
    BitstampExchange  = require('./Exchange/Bitstamp/BitstampExchange.js'),
    OrderBookManager  = require('./Exchange/Manager/OrderBookManager.js'),
    ExchangeManager   = require('./Exchange/Manager/ExchangeManager.js');

// has to be same order as exchange manager
OrderBookManager  = new OrderBookManager()
    .addOrderBook(new CoinbaseOrderBook())
    .addOrderBook(new BitstampOrderBook());

// has to be same order as exchange manager
ExchangeManager = new ExchangeManager()
    .addExchange(new CoinbaseExchange())
    .addExchange(new BitstampExchange());

new Arbiter(.00005) // threshold
    .arbTwoExchanges(OrderBookManager,ExchangeManager,new Trader());
