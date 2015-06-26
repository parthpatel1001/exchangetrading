export class OrderBook {
    constructor(bid, ask, exchange) {
        this.bid = bid;
        this.ask = ask;
        this.exchange = exchange;
    }

    get Bid() {
        return this.bid;
    }

    get Ask() {
        return this.ask;
    }

    get Exchange() {
        return this.exchange;
    }
}
