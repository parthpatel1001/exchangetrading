/**
 * Created by parthpatel1001 on 5/17/15.
 */
var
    Redis = require("redis"),
    Order = require('../lib/Order/Order.js'),
    OrderSubscriber = require('../lib/Order/OrderSubscriber.js'),
    OrderProcessor = require('../lib/Order/OrderProcessor.js');

// TODO move this to a config
var MAX_TRADE_AMOUNT = 5.0;
OrderProcessor = new OrderProcessor(MAX_TRADE_AMOUNT);
OrderSubscriber = new OrderSubscriber(Redis,Order);

OrderSubscriber.subscribeToLinkedOrderStream("LINKED_ORDER_STREAM",OrderProcessor.processLinkedOrder);