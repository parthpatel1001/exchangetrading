import Pusher from 'pusher-client';
import config from 'config';
import {OrderBook} from '../../OrderBook/OrderBook';
import {PriceAmount} from '../../OrderBook/PriceAmount';

/**
 * Wraps the Bitstamp Order Book API and passes the provided callback
 * a plain js object of the top of the book
 * @constructor
 */
// TODO: Create an OrderBookBase class
export class BitstampOrderBook {
    constructor(exchange) {
        this.exchange = exchange; // TODO: Not sure this is really needed but I thik I go from OrderBook to Order without access otherwise so I think we need it here to pass down

        if(config.get('Exchange.Coinbase.use_live_orderbook')) {
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
        } else {
            /**
             * Fake some orderbook top data
             * @param callback
             */
            this.subscribe = (callback) => {
                setInterval(() => {
                    var bid = (1.0 - Math.random()) * 250;
                    var ask = bid - 1;
                    // make sure the ask is realistic
                    while (ask < bid) {
                        ask = bid * (1.0 + Math.random());
                    }
                    return callback(new OrderBook(
                        new PriceAmount(bid, (Math.random() * 5)),
                        new PriceAmount(ask, (Math.random() * 5)),
                        this.Exchange
                    ));
                }, 7500);
            };
        }
    }

    get Exchange() {
        return this.exchange;
    }
}
