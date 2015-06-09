import config from 'config';
import {BalanceTracker} from './Balance/BalanceTracker';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';
import {OrderProcessor} from './Order/OrderProcessor';
import {OrderSubscriber} from './Order/OrderSubscriber';

var ExchangeManager   = require('../es5/Exchange/ExchangeManager.js');

let coinbase = new CoinbaseExchange(),
    bitstamp = new BitstampExchange();

let exchanges = [coinbase, bitstamp];

let exchangeManager = new ExchangeManager();
for(let i = 0, len = exchanges.length; i < len; i++) {
    exchangeManager.addExchange(exchanges[i]);
}

let balanceTracker = new BalanceTracker(exchanges);

let orderProcessor = new OrderProcessor(exchangeManager,balanceTracker),
    orderSubscriber = new OrderSubscriber();

orderSubscriber.subscribeToLinkedOrderStream(config.get('EventChannels.LINKED_ORDER_STREAM'),orderProcessor.processLinkedOrder);
