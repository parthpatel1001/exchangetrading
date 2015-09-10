import {ExchangeBase} from "./ExchangeBase.js";
import {BitstampExchange} from "./Wrappers/BitstampExchange.js";
import {CoinbaseExchange} from "./Wrappers/CoinbaseExchange.js";
import config from 'config';

let bitstampExchangeId = config.get('Exchange.Bitstamp.id'),
    coinbaseExchangeId = config.get('Exchange.Coinbase.id');

export class ExchangeFactory {
    /**
     * @param id
     * @returns {ExchangeBase}
     */
    static createFromId(id) {
        if(id === null || id === undefined) {
            throw new TypeError('Must have an ID to create exchange from ' + JSON.stringify(id));
        }

        switch(id) {
            case bitstampExchangeId:
                return ExchangeFactory.createBitstampExchange();
            case coinbaseExchangeId:
                return ExchangeFactory.createCoinbaseExchange();
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
    static createCoinbaseExchange() {
        return new CoinbaseExchange();
    }
}