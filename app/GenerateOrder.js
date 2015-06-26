import {Arbiter} from './Trading/Arbiter';
import {OrderBookSubscriber} from './OrderBook/OrderBookSubscriber';
import {OrderGenerator} from './Order/OrderGenerator';
import {OrderPublisher} from './Order/OrderPublisher';

let orderPublisher = new OrderPublisher(),
    orderGenerator = new OrderGenerator(orderPublisher);

let arbiter = new Arbiter(orderGenerator);

let orderBookSubscriber = new OrderBookSubscriber(arbiter, 'subscribeTo2ExchangeArbOpportunities');
