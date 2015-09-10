import Pusher from 'pusher-client';
import config from 'config';
import {OrderBook} from '../OrderBook';
import {OrderBookTranslatorBase} from './TranslatorBase'
import {BitstampExchange} from '../../Exchange/Wrappers/BitstampExchange.js';
import {PriceAmount} from '../PriceAmount';

let exchange = new BitstampExchange();

/**
 * Wraps the Bitstamp Order Book API and passes the provided callback
 * a plain js object of the top of the book
 * @constructor
 */
export class BitstampOrderBookTranslator extends OrderBookTranslatorBase {
    constructor() {
        super(exchange);

        if(config.get('Exchange.Bitstamp.use_live_orderbook')) {
            /**
             * Subscribe to the bitstamp order book api
             * @param {function} callback
             */
            this.subscribe = (callback) => {
                var bitstamp_pusher = new Pusher('de504dc5763aeef9ff52'),
                    order_book = bitstamp_pusher.subscribe('order_book');
                order_book.bind('data', (orders) => {
                    return callback(new OrderBook(
                        new PriceAmount(parseFloat(orders.bids[0][0]), parseFloat(orders.bids[0][1])),
                        new PriceAmount(parseFloat(orders.asks[0][0]), parseFloat(orders.asks[0][1])),
                        this.Exchange
                    ));
                });
            };
        }
    }
}
