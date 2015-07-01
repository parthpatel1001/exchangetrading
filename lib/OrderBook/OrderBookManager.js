export class OrderBookManager {
    constructor() {
        this.orderBooks = new Map();
        this.orderBookTop = new Map();
    }

    /**
     * @param orderBook
     */
    addOrderBook(orderBook) {
        this.orderBooks.set(orderBook.Exchange.ExchangeId, orderBook);
        return this;
    }

    subscribeToBook(index,callback) {
        this.orderBooks.get(index).subscribe((book) => {
            this.orderBookTop.set(index, book);
            callback(this.orderBookTop);
        });
    }

    subscribeToOrderBooks(callback) {
        for(let bookIndex of this.orderBooks.keys()) {
            this.subscribeToBook(bookIndex,callback);
        }
    }
}
