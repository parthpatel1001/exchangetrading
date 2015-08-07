import num from 'num';

export class OrderBase {
    /**
     *
     * @param {int} id
     * @param {float} price
     * @param {float} amount
     * @param {int} exchange
     */
    constructor(id, price, amount, exchange, type) {
        this.id = id;
        this.price = num(price);
        this.amount = num(amount);
        this.exchange = exchange;
        this.type = type;
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

    get Type() {
        return this.type;
    }

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

    serialize(){
        console.log('orderbase', this.Exchange);

        return JSON.stringify({
            id: this.Id,
            price: this.Price,
            amount: this.Amount,
            exchange: this.Exchange.serialize(),
            type: this.Type
        });
    }


    /**
     * there is some magical es6 function name you can use
     * so instead of myInstance.compare(myOtherInstance)
     * you can do myInstance === myOtherInstance
     * @param order
     * @returns {boolean}
     */
    compare(order) {
        return this.id == order.id &&
            this.price.cmp(order.price) === 0 &&
            this.amount.cmp(order.amount) === 0 &&
            this.exchange.cmp(order.exchange) === 0;
    }
}
