import CoinbaseExchange from 'coinbase-exchange';
import config from 'config';
import {OrderBook} from '../../OrderBook/OrderBook'
import {PriceAmount} from '../../OrderBook/PriceAmount'

/**
 * Wraps the Coinbase Order Book API and passes the provided callback
 * a plain js object of the top of the orderbook
 * @constructor
 */
// TODO: Create an OrderBookBase class
export class CoinbaseOrderBook {
    constructor(exchange) {
        this.exchange = exchange;

        if (config.get('Exchange.Coinbase.use_live_orderbook')) {
            /**
             * subscribe to the Coinbase orderbook api
             * @param callback
             */
            this.subscribe = (callback) => {
                var orderbookSync = new CoinbaseExchange.OrderbookSync();
                orderbookSync.subscribe((book) => {
                    book = book.state();
                    var bid = book.bids[0],
                        ask = book.asks[0];

                    return callback(new OrderBook(
                            new PriceAmount(bid.price, bid.size),
                            new PriceAmount(ask.price, ask.size),
                            this.Exchange)
                    );
                });
            }
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
                            this.Exchange)
                    );
                }, 5000);
            };
        }
    }

    get Exchange() {
        return this.exchange;
    }
}
