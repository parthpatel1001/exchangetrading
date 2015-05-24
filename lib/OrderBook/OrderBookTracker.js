/**
 * Created by parthpatel1001 on 5/14/15.
 */
var OrderBookTracker = function(Track){
    var PREFIX = 'orderbook.tick.';

    this.trackOrderBook = function(bookTop){

        for(var i in bookTop) {
            var book = bookTop[i];
            if(book) {
                var exchangeName = Track.getExchangeName(book.exchangeId);
                Track.gauge(PREFIX+exchangeName+'.bid.price',book.bid.price);
                Track.gauge(PREFIX+exchangeName+'.bid.amount',book.bid.amount);
                Track.gauge(PREFIX+exchangeName+'.ask.price',book.ask.price);
                Track.gauge(PREFIX+exchangeName+'.ask.amount',book.ask.amount);
            }
        }
    };
};

module.exports = exports = OrderBookTracker;