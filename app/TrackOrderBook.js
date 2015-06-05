var
    OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js'),
    OrderBookTracker = require('../lib/OrderBook/OrderBookTracker.js');

OrderBookTracker = new OrderBookTracker();
OrderBookSubscriber = new OrderBookSubscriber();
OrderBookSubscriber.subscribeToOrderBookTop(OrderBookTracker.trackOrderBook);
