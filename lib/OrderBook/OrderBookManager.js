/**
 * Created by parthpatel1001 on 5/12/15.
 */

var OrderBookManager = function() {
    var orderBooks = [];
    var orderBookTop = [];


    /**
     * @param orderBook
     */
    this.addOrderBook = function(orderBook) {
        orderBooks.push(orderBook);
        return this;
    };

    var subscribeToBook = function(index,callback) {
        orderBooks[index].subscribe(function(book){
            orderBookTop[index] = book;
            callback(orderBookTop);
        });
    };
    this.subscribeToOrderBooks = function(callback){
        for(var i = 0; i < orderBooks.length; i++) {
            subscribeToBook(i,callback);
        }
    };
};

module.exports = exports = OrderBookManager;
