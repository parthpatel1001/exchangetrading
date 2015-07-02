export class OrderBookManager {
    constructor() {
        this.orderBooks = new Map();
        this.orderBookTop = {}; // Can't make this a map because that's note JSON-able
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
            console.log('subscribeToBook subscribe', book, this.orderBookTop.size);
            this.orderBookTop.set(exchId, book);
            callback(this.orderBookTop);
        });
    }

    subscribeToOrderBooks(callback) {
        for(let exchId of this.orderBooks.keys()) {
            this.subscribeToBook(exchId,callback);
        }
    }
}
