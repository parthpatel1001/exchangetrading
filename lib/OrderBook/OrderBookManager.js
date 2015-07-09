import {OrderBook} from './OrderBook'

export class OrderBookManager {
    constructor() {
        this.orderBooks = new Map();
        this.orderBookTop = {}; // TODO: Build out a Map->Json converter
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
            callback(this.orderBookTop);
        });
    }

    subscribeToOrderBooks(callback) {
        for(let exchId of this.orderBooks.keys()) {
            this.subscribeToBook(exchId,callback);
        }
    }
}
