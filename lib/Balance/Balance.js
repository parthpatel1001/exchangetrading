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

    constructor(exchangeId, usdAvail, btcAvail) {
        this.exchangeId = exchangeId;

        // in case a null balanceIn is passed in, num() can handle num(null)
        this.usd_avail = num(usdAvail) || {};
        this.btc_avail = num(btcAvail) || {};
    }

    /**
     * named constructor to pass in a object instead of individual parameters
     * @param {{usd_avail:number,btc_avail:number,exchange_id:number}} plainBalObj
     * @returns {Balance}
     */
    static createFromPlainObject(plainBalObj){
        return new Balance(plainBalObj.exchange_id, plainBalObj.usd_avail,plainBalObj.btc_avail);
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

    serialize() {
        return JSON.stringify({
            usd_avail: this.USDAvailable,
            btc_avail: this.BTCAvailable,
            exchangeId: this.ExchangeId
        });
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
}
