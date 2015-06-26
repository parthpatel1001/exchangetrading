export class OrderBookManager {
    constructor() {
        this.orderBooks = new Map();
        this.orderBookTop = new Map();
    }

    /**
     * @param orderBook
     */
    addOrderBook(orderBook) {
        this.orderBooks.set(orderBook.Exchange.Id, orderBook);
        return this;
    }

    subscribeToBook(index,callback) {
        this.orderBooks.get(index).subscribe((book) => {
            this.orderBookTop.set(index, book);
            callback(this.orderBookTop);
        });
    }

    subscribeToOrderBooks(callback) {
        for(var bookIndex in this.orderBooks.values()) {
            this.subscribeToBook(bookIndex,callback);
        }
    }
}
