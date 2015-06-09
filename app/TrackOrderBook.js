import {OrderBookSubscriber} from './OrderBook/OrderBookSubscriber';
var
    OrderBookTracker = require('../lib/OrderBook/OrderBookTracker.js');

OrderBookTracker = new OrderBookTracker();
let orderBookSubscriber = new OrderBookSubscriber();
orderBookSubscriber.subscribeToOrderBookTop(OrderBookTracker, 'trackOrderBook');
