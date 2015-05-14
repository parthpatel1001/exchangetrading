/**
 * Created by parthpatel1001 on 5/9/15.
 */
var BitstampExchange = function() {
    var name = 'Bitstamp';

    this.buy = function(price,amount){
        return name+'(BUY '+amount.set_precision(4).toString()+','+price.set_precision(4).toString()+')';
    };

    this.sell = function(price,amount){
        return name+'(SELL,'+amount.set_precision(4).toString()+','+price.set_precision(4).toString()+')';
    };

    this.noTrade = function(book) {
        return name+' (['+book.bid.amount.set_precision(4).toString()+','+book.bid.price.set_precision(4).toString()+']['+book.ask.amount.set_precision(4).toString()+','+book.ask.price.set_precision(4).toString()+'])';
    };

    this.getName = function() { return name;};
};

module.exports = exports = BitstampExchange;