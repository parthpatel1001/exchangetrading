import 'babel/polyfill';
import {Arbiter} from './Trading/Arbiter';
import {OrderBookSubscriber} from './OrderBook/OrderBookSubscriber';
import {OrderGenerator} from './Order/OrderGenerator';
import {OrderPublisher} from './Order/OrderPublisher';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';
import {ExchangeManager} from './Exchange/ExchangeManager';

let exchangeManager = new ExchangeManager(
    new CoinbaseExchange(),
    new BitstampExchange()
);

let orderPublisher = new OrderPublisher(),
    orderGenerator = new OrderGenerator(orderPublisher);

let arbiter = new Arbiter(orderGenerator);

let orderBookSubscriber = new OrderBookSubscriber(exchangeManager, arbiter, 'processOpportunities');
