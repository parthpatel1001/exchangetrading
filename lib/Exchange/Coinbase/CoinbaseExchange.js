/**
 * Created by parthpatel1001 on 5/9/15.
 */
var CoinbaseExchangeClient = require('coinbase-exchange');
var CoinbaseExchange = function(exchangeId) {

    var name = 'Coinbase';
    var key = '';
    var secret = '';
    var thing = '';
    var authedClient = new CoinbaseExchangeClient.AuthenticatedClient(key,secret,thing);
    var buy = function(price,amount){
        var expected_result = name+'(BUY '+amount+','+price+')';
        console.log(expected_result);
        authedClient.buy({
            'price' : price,
            'size': amount,
            'product_id' : 'BTC-USD'
        },function(err,response,data){
            if(err) { console.log(err); }
            console.log(data);
        });
    };
    var sell = function(price,amount){
        var expected_result = name+'(SELL,'+amount+','+price+')';
        console.log(expected_result);
        authedClient.sell({
            'price' : price,
            'size': amount,
            'product_id' : 'BTC-USD'
        },function(err,response,data){
            if(err) { console.log(err); }
            console.log(data);
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

module.exports = exports = CoinbaseExchange;