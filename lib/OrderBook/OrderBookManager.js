var OrderBookManager = function() {
    var orderBooks = {};
    var orderBookTop = {};

    /**
     * @param orderBook
     */
    this.addOrderBook = function(orderBook) {
        orderBooks[orderBook.getExchangeId()] = orderBook;
        return this;
    };

    var subscribeToBook = function(index,callback) {
        orderBooks[index].subscribe(function(book){
            orderBookTop[index] = book;
            callback(orderBookTop);
        });
    };
    this.subscribeToOrderBooks = function(callback){
        for(var bookIndex in orderBooks) {
            subscribeToBook(bookIndex,callback);
        }
    };
};

module.exports = exports = OrderBookManager;
