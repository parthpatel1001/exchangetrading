export class OrderBookManager {
    constructor() {
        this.orderBooks = new Map();
        this.orderBookTop = {}; // Can't make this a map because that's not JSON-able
    }

    /**
     * @param orderBook
     */
    addOrderBook(orderBook) {
        this.orderBooks.set(orderBook.Exchange.ExchangeId, orderBook);
        return this;
    }

    subscribeToBook(exchId,callback) {
        this.orderBooks.get(exchId).subscribe((book) => {
            this.orderBookTop[exchId] = book;
            console.log('subscribeToBook subscribe', this.orderBookTop);
            callback(this.orderBookTop);
        });
    }

    subscribeToOrderBooks(callback) {
        for(let exchId of this.orderBooks.keys()) {
            this.subscribeToBook(exchId,callback);
        }
    }
}
