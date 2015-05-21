/**
 * Created by parthpatel1001 on 5/9/15.
 */
var Bitstamp = require('bitstamp');

var BitstampExchange = function(exchangeId) {
    var name = 'Bitstamp';
    var key = '';
    var secret = '';
    var username = '';
    var privateBitstamp = new Bitstamp(key,secret,username);

    var buy =  function(price,amount){

        var expected_result = name+'(BUY '+amount+','+price+')';
        console.log(expected_result);
        privateBitstamp.sell(amount,price,function(result){
            console.log(result);
        });
    };

    var sell = function(price,amount){
        var expected_result =  name+'(SELL,'+amount+','+price+')';
        console.log(expected_result);
        privateBitstamp.sell(amount,price,function(result){
            console.log(result);
        });
    };
    this.processOrder = function(order) {
        if(order.isBuyOrder()) {
            return buy(order.getPrice().toString(),order.getAmount().toString());
        }
        if(order.isSellOrder()) {
            return sell(order.getPrice().toString(),order.getAmount().toString());
        }
    };
    this.noTrade = function(book) {
        return name+' (['+book.bid.amount.set_precision(4).toString()+','+book.bid.price.set_precision(4).toString()+']['+book.ask.amount.set_precision(4).toString()+','+book.ask.price.set_precision(4).toString()+'])';
    };

    this.getName = function() { return name;};

    this.getExchangeId = function() {return exchangeId;};
};

module.exports = exports = BitstampExchange;