/**
 * Created by parthpatel1001 on 5/17/15.
 */
var
    Redis = require("redis"),
    Order = require('../lib/Order/Order.js'),
    OrderSubscriber = require('../lib/Order/OrderSubscriber.js'),
    OrderProcessor = require('../lib/Order/OrderProcessor.js'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js'),
    ExchangeManager   = require('../lib/Exchange/ExchangeManager.js'),
    BalanceTracker = require('../lib/Balance/BalanceTracker.js'),
    Balance = require('../lib/Balance/Balance.js'),
    config = require('config');


ExchangeManager = new ExchangeManager()
    .addExchange(new CoinbaseExchange(config.get('Exchange.Coinbase.id')))
    .addExchange(new BitstampExchange(config.get('Exchange.Bitstamp.id')));

BalanceTracker = new BalanceTracker(Redis,Balance);

OrderProcessor = new OrderProcessor(ExchangeManager,BalanceTracker);
OrderSubscriber = new OrderSubscriber(Redis,Order);

OrderSubscriber.subscribeToLinkedOrderStream(config.get('EventChannels.LINKED_ORDER_STREAM'),OrderProcessor.processLinkedOrder);