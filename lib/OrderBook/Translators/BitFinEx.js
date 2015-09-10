import config from 'config';
import {OrderBook} from '../OrderBook';
import {OrderBookTranslatorBase} from './TranslatorBase';
import {BitFinExExchange} from '../../Exchange/Wrappers/BitFinExExchange';
import {PriceAmount} from '../PriceAmount';
import Bitfinex from 'bitfinex-promise';

let key = config.get('Exchange.BitFinEx.key'),
    secret = config.get('Exchange.BitFinEx.secret'),
    privateBitFinEx = new Bitfinex(key,secret),
    exchange = new BitFinExExchange(),
    orderBookInterval = 7500; // TODO: Move this into the config

let symbol = 'btcusd';
// TODO: Is the above right?
// From Docs: Currently "btcusd", "ltcusd", "ltcbtc".

/**
 * Wraps the BitFinEx Order Book API and passes the provided callback
 * a OrderBook object of the top of the book
 * @constructor
 */
export class BitFinExOrderBookTranslator extends OrderBookTranslatorBase {
    constructor() {
        super(exchange);

        if(config.get('Exchange.BitFinEx.use_live_orderbook')) {
            /**
             * Subscribe to the BitFinEx order book api
             * @param {function} callback
             */
            this.subscribe = (callback) => {
                setInterval(() => {
                    privateBitFinEx.orderbook(symbol).then((orders) => {
                        return callback(new OrderBook(
                            new PriceAmount(parseFloat(orders.bids[0].price), parseFloat(orders.bids[0].amount)),
                            new PriceAmount(parseFloat(orders.asks[0].price), parseFloat(orders.asks[0].amount)),
                            this.Exchange
                        ));
                    }).catch((e) => {
                        console.log('BitFinEx OrderBook errored', e);
                    });
                }, orderBookInterval);
            };
        }
    }
}
