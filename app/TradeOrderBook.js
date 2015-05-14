/**
 * Created by parthpatel1001 on 5/14/15.
 */
var
    Redis = require("redis"),
    Arbiter = require('../lib/Trading/Arbiter.js'),
    Trader  = require('../lib/Trading/Trader.js'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js'),
    ExchangeManager   = require('../lib/Exchange/ExchangeManager.js'),
    OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js');

new OrderBookSubscriber(Redis)
    .subscribeToOrderBookTop(
    'ORDER_BOOK_TICK', // TODO move this to a config
    new Arbiter(
        .00005, // TODO move to config threshold
        // TODO make this safer by making an exchangeOBHolder
        // has to be same order as exchange manager
        new ExchangeManager()
            .addExchange(new CoinbaseExchange())
            .addExchange(new BitstampExchange()),
        new Trader()
    ).arbTwoExchanges
);