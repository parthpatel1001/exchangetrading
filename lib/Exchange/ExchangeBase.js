import {Balance} from '../Balance/Balance'
import num from 'num';

export class ExchangeBase {
    constructor(name, exchangeId, fee) {
        this.name = name;
        this.exchangeId = exchangeId;
        this.fee = num(fee);
    }

    get Name() { return this.name;};

    get ExchangeId() {return this.exchangeId;};

    get Fee(){ return this.fee; };

    getBalance(callback) {
        // TODO: How to check that this is implemented in production mode in derived classes?
        let newBal = new Balance(this.ExchangeId, Math.random()*1000, Math.random()*8);
        callback(null, newBal);
    }

    noTrade(book) {
        // TODO: How to check that this is implemented in production mode in derived classes?
        return this.name + ' (['+book.bid.amount.set_precision(4).toString()+','+book.bid.price.set_precision(4).toString()+']['+book.ask.amount.set_precision(4).toString()+','+book.ask.price.set_precision(4).toString()+'])';
    }

    processOrder(order) {
        // TODO: How to check that this is implemented in production mode in derived classes?
        console.log('ExchangeBase ProcessOrder', order.serialize());
        return false;
    }

    serialize() {
        return JSON.stringify({
            name: this.Name,
            exchangeId: this.ExchangeId,
            fee: this.Fee
        });
    }

    /**
     * there is some magical es6 function name you can use
     * so instead of myInstance.compare(myOtherInstance)
     * you can do myInstance === myOtherInstance
     * @param order
     * @returns {boolean}
     */
    compare(exch) {
        return this.name === exch.name &&
            this.exchangeId === exch.exchangeId &&
            this.fee.cmp(exch.fee) === 0;
    }
}
