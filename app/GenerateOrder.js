/**
 * Created by parthpatel1001 on 5/14/15.
 */
var
    Redis = require("redis"),
    Arbiter = require('../lib/Trading/Arbiter.js'),
    OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js'),
    Order = require('../lib/Order/Order.js'),
    OrderGenerator = require('../lib/Order/OrderGenerator.js'),
    OrderPublisher = require('../lib/Order/OrderPublisher.js'),
    config = require('config');

OrderGenerator = new OrderGenerator(Order,config.get('TradeThresholds.MAX_TRADE_AMOUNT'));


OrderGenerator.registerOrderPublisher(new OrderPublisher(Redis,config.get('EventChannels.LINKED_ORDER_STREAM')));

Arbiter = new Arbiter(config.get('TradeThresholds.COINBASE_BITSTAMP_ARB_THRESHOLD'));
Arbiter.registerOrderGenerator(OrderGenerator);

OrderBookSubscriber = new OrderBookSubscriber(Redis);
OrderBookSubscriber.subscribeToOrderBookTop(config.get('EventChannels.ORDER_BOOK_TICK'), Arbiter.subscribeTo2ExchangeArbOppurtunities);
