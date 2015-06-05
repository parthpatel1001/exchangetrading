var OrderSubscriber = require('../lib/Order/OrderSubscriber.js'),
    OrderProcessor = require('../lib/Order/OrderProcessor.js'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js'),
    ExchangeManager   = require('../lib/Exchange/ExchangeManager.js'),
    BalanceTracker = require('../lib/Balance/BalanceTracker.js'),
    config = require('config');

var coinbase = new CoinbaseExchange(),
    bitstamp = new BitstampExchange();

var exchanges = [coinbase, bitstamp];

ExchangeManager = new ExchangeManager();
for(var i = 0, len = exchanges.length; i < len; i++) {
    ExchangeManager.addExchange(exchanges[i]);
}

BalanceTracker = new BalanceTracker(exchanges);

OrderProcessor = new OrderProcessor(ExchangeManager,BalanceTracker);
OrderSubscriber = new OrderSubscriber();

OrderSubscriber.subscribeToLinkedOrderStream(config.get('EventChannels.LINKED_ORDER_STREAM'),OrderProcessor.processLinkedOrder);