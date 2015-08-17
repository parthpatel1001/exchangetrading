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
        throw 'Must implement getBalance in Derived class!';
    }

    noTrade(book) {
        throw 'Must implement noTrade in Derived class!';
    }

    processOrder(order) {
        throw 'Must implement processOrder in Derived class!';
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
