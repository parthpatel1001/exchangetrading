import num from 'num';

let BUY_ORDER_TYPE = 'BUY',
    SELL_ORDER_TYPE = 'SELL';

export class OrderBase {
    constructor(id, price, amount, exchange) {
        this.id = id;
        this.price = num(price);
        this.amount = num(amount);
        this.exchange = num(exchange);
    }

    get Price() {
        return this.price;
    };

    get Amount() {
        return this.amount;
    };

    get Exchange() {
        return this.exchange;
    };

    get Id() { // TODO: This was here as OrderId but was never actually used... But feels like we should have it.
        return this.id;
    };

    /**
     * Get the magnitude (price*amount) of the order
     * @returns {num}
     */
    get Magnitude() {
        return this.price.mul(this.amount);
    };

    /**
     * Get the cost of this order provided the exchange
     * If it is a buy order the order "costs" the cash cost of the order *plus* the fee
     * If it is a sell order the order "costs" the cash proceed of the order *minus* the fee
     * @param fee num object
     * @returns {num}
     */
    getCost(fee) {
        throw 'Must implement Cost in Derived class!'; // TODO: How does one do virtual functions in es6?
    };

    serialize() {
        return JSON.stringify(this.curOrder);
    };
}
