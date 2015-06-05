var
    Redis = require("redis"),
    OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js'),
    Track = require('../lib/Track/Track.js'),
    OrderBookTracker = require('../lib/OrderBook/OrderBookTracker.js'),
    config = require('config');

OrderBookTracker = new OrderBookTracker(Track);
OrderBookSubscriber = new OrderBookSubscriber(Redis);
OrderBookSubscriber.subscribeToOrderBookTop(OrderBookTracker.trackOrderBook);
