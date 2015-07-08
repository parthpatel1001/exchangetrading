import 'babel/polyfill';
import {OrderBookSubscriber} from './OrderBook/OrderBookSubscriber';
import {OrderBookTracker} from './OrderBook/OrderBookTracker.js';

let orderBookTracker = new OrderBookTracker();
let orderBookSubscriber = new OrderBookSubscriber(orderBookTracker, 'trackOrderBook');
