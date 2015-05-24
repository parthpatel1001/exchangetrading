/**
 * Created by parthpatel1001 on 5/14/15.
 */
var
    Redis = require("redis"),
    OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js'),
    Track = require('../lib/Track/Track.js'),
    OrderBookTracker = require('../lib/OrderBook/OrderBookTracker.js'),
    config = require('config');

OrderBookTracker = new OrderBookTracker(Track);
OrderBookSubscriber = new OrderBookSubscriber(Redis);
OrderBookSubscriber.subscribeToOrderBookTop(config.get('EventChannels.ORDER_BOOK_TICK'),OrderBookTracker.trackOrderBook);
