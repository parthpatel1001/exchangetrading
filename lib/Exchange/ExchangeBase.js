export class ExchangeBase {
    constructor(name, exchangeId, fee) {
        this.name = name;
        this.exchangeId = exchangeId;
        this.fee = fee;
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
        throw 'Must implement noTrade in Derived class!';
    }
}