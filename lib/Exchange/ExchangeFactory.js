import {BitstampExchange} from "./Bitstamp/BitstampExchange.js";
import {CoinbaseExchange} from "./Coinbase/CoinbaseExchange.js";
import config from 'config';

let bitstampExchangeId = config.get('Exchange.Bitstamp.id'),
    coinbaseExchangeId = config.get('Exchange.Coinbase.id');

export class ExchangeFactory {
    /**
     * @param ser
     * @returns {OrderBase}
     */
    static createFromId(id) {
        if(!id) {
            throw new TypeError('Must have an ID to create exchange from ' + JSON.stringify(ser));
        }

        switch(id) {
            case bitstampExchangeId:
                return new BitstampExchange();
            case coinbaseExchangeId:
                return new CoinbaseExchange();
            default:
                throw new Error("Unknown Exchange ID: " + id);
        }
    }

    /**
     * Should *always* return a BitstampExchange
     * @returns {BitstampExchange}
     */
    static createBitstampExchange() {
        return new BitstampExchange();
    }

    /**
     * Should *always* return a CoinbaseExchange
     * @returns {CoinbaseExchange}
     */
    static createCoinbaseExchange(ser) {
        return new CoinbaseExchange();
    }
}