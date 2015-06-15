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

    constructor(balanceIn) {
        this.balance = balanceIn || {}; // in case a null balanceIn is passed in, num() can handle num(null)
    }

    getUSDAvailable() {
        return num(this.balance.usd_avail);
    };

    getBTCAvailable() {
        return num(this.balance.btc_avail);
    };

    setUSDAvailable(amount) {
        this.balance.usd_avail = amount.toString();
    };

    setBTCAvailable(amount) {
        this.balance.btc_avail = amount.toString();
    };

    getExchangeId() {
        return this.balance.exchangeId;
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
         if(this.getExchangeId() !== compareWith.getExchangeId()) {
         throw new Error('fdsa');
         }
         */
        return this.getUSDAvailable() == compareWith.getUSDAvailable()
            && this.getBTCAvailable == compareWith.getBTCAvailable()
            && this.getExchangeId() == compareWith.getExchangeId();
    }

    /**
     * Returns an object that can be persisted
     * This *must* be flat (1key:1value)
     * // TODO UNIT TEST THIS SHIT
     * @returns {{usd_avail: (*|usd_avail), btc_avail: (*|btc_avail), exchangeId: (*|exchangeId)}}
     */
    getPersistable() {
        return {
            usd_avail: balance.usd_avail,
            btc_avail: balance.btc_avail,
            exchangeId: balance.exchangeId
        }
    }
}
