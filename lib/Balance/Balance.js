import num from 'num';

/**
 * Balance is a value object that wraps a plain {} object with getter/setters
 * The advantage of the getters is if balance == {}
 * The getters will return the equivalent of num(0) -- letting us avoid doing
 * if(balance.usd_avail && balance.btc_avail ....)
 * @param balance | Balance in is a plain js object
 * @constructor
 */
export class Balance {
    balance;

    constructor(usdAvail, btcAvail, exchangeId) {
        // in case a null balanceIn is passed in, num() can handle num(null)
        this.usd_avail = num(usdAvail) || {};
        this.btc_avail = num(btcAvail) || {};
        this.exchangeId = exchangeId;
    }

    get USDAvailable() {
        return this.usd_avail;
    };

    get BTCAvailable() {
        return this.btc_avail;
    };

    set USDAvailable(amount) {
        this.balance.usd_avail = num(amount);
    };

    set BTCAvailable(amount) {
        this.balance.btc_avail = num(amount);
    };

    get ExchangeId() {
        return this.exchangeId;
    };

    /**
     * this should get deprecated &or deleted
     * ...wish we had dem unit tests so  i could safely nuke this
     * @deprecated (?is this a real jsdoc tag? airplane/beer no google)
     * @returns {*}
     */
    serialize() {
        return JSON.stringify(this.balance);
    }

    /**
     * Compare the provided balance object with this
     * @param {Balance} compareWith
     * @returns {boolean}
     */
    compare(compareWith) {
        // TODO decide if this makes sense
        // it might not because somtimes comparewith will/could be a 'null' balance
        /*
         if(this.ExchangeId !== compareWith.ExchangeId) {
         throw new Error('fdsa');
         }
         */
        return this.USDAvailable == compareWith.USDAvailable
            && this.BTCAvailable == compareWith.BTCAvailable
            && this.ExchangeId == compareWith.ExchangeId;
    }

    /**
     * Returns an object that can be persisted
     * This *must* be flat (1key:1value)
     * // TODO UNIT TEST THIS SHIT
     * @returns {{usd_avail: (*|usd_avail), btc_avail: (*|btc_avail), exchangeId: (*|exchangeId)}}
     */
    get Persistable() {
        return {
            usd_avail: this.USDAvailable,
            btc_avail: this.BTCAvailable,
            exchangeId: this.ExchangeId
        }
    }
}
