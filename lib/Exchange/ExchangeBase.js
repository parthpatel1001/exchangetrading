export class ExchangeBase {
    constructor(name, exchangeId, fee) {
        this.name = name;
        this.exchangeId = exchangeId;
        this.fee = fee;
    }

    get Name() { return this.name;};

    get ExchangeId() {return this.exchangeId;};

    get Fee(){ return this.fee; };
}