import CoinbaseExchange from 'coinbase-exchange';
import config from 'config';
import {OrderBook} from '../OrderBook'
import {PriceAmount} from '../PriceAmount'
import {CoinbaseExchange as CbExchWrapper} from '../../Exchange/Wrappers/CoinbaseExchange';
import {OrderBookTranslatorBase} from './TranslatorBase';

let exchange = new CbExchWrapper();

/**
 * Wraps the Coinbase Order Book API and passes the provided callback
 * a plain js object of the top of the orderbook
 * @constructor
 */
export class CoinbaseOrderBookTranslator extends OrderBookTranslatorBase {
    constructor() {
        super(exchange);

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
        }
    }
}
