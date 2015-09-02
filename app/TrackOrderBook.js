import 'babel/polyfill';
import {OrderBookSubscriber} from './OrderBook/OrderBookSubscriber';
import {OrderBookTracker} from './OrderBook/OrderBookTracker.js';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';
import {ExchangeManager} from './Exchange/ExchangeManager';
import {Notification, NotificationLevels} from './Notification';

Notification.eventTriggered("Application Start Up", "TrackOrderBook", "", NotificationLevels.HIGH);

let exchangeManager = new ExchangeManager(
    new CoinbaseExchange(),
    new BitstampExchange()
);

let orderBookTracker = new OrderBookTracker();
let orderBookSubscriber = new OrderBookSubscriber(exchangeManager, orderBookTracker, 'trackOrderBook');
