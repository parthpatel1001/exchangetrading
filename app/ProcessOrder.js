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
    ExchangeManager   = require('../lib/Exchange/ExchangeManager.js');

// TODO move this to a config
var COINBASE_EXCHANGE_ID = 0;
var BITSTAMP_EXCHANGE_ID = 1;
ExchangeManager = new ExchangeManager()
    .addExchange(new CoinbaseExchange(COINBASE_EXCHANGE_ID))
    .addExchange(new BitstampExchange(BITSTAMP_EXCHANGE_ID));

// TODO move this to a config
OrderProcessor = new OrderProcessor(ExchangeManager);
OrderSubscriber = new OrderSubscriber(Redis,Order);

OrderSubscriber.subscribeToLinkedOrderStream("LINKED_ORDER_STREAM",OrderProcessor.processLinkedOrder);