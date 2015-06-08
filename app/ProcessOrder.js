import config from 'config';
import {BalanceTracker} from './Balance/BalanceTracker';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';

var OrderSubscriber = require('../es5/Order/OrderSubscriber.js'),
    OrderProcessor = require('../es5/Order/OrderProcessor.js'),
    ExchangeManager   = require('../es5/Exchange/ExchangeManager.js');

var coinbase = new CoinbaseExchange(),
    bitstamp = new BitstampExchange();

var exchanges = [coinbase, bitstamp];

ExchangeManager = new ExchangeManager();
for(var i = 0, len = exchanges.length; i < len; i++) {
    ExchangeManager.addExchange(exchanges[i]);
}

let balanceTracker = new BalanceTracker(exchanges);

OrderProcessor = new OrderProcessor(ExchangeManager,balanceTracker);
OrderSubscriber = new OrderSubscriber();

OrderSubscriber.subscribeToLinkedOrderStream(config.get('EventChannels.LINKED_ORDER_STREAM'),OrderProcessor.processLinkedOrder);