/**
 * Created by parthpatel1001 on 5/9/15.
 */
var Bitstamp = require('bitstamp');
var config = require('config');
var num = require('num');

var BitstampExchange = function(exchangeId) {
    var name = 'Bitstamp';
    var key = config.get('Exchange.Bitstamp.key');
    var secret = config.get('Exchange.Bitstamp.secret');
    var clientId = config.get('Exchange.Bitstamp.clientId');
    var privateBitstamp = new Bitstamp(key,secret,clientId);
    var fee = num(config.get('Exchange.Bitstamp.trade_fee'));

    var buy =  function(price,amount){

        var expected_result = name+'(BUY '+amount+','+price+')';
        console.log(expected_result);
        privateBitstamp.buy(amount,price,function(err,result){
            console.log("BitstampBuy: "+JSON.stringify(result));
        });
    };

    var sell = function(price,amount){
        var expected_result =  name+'(SELL,'+amount+','+price+')';
        console.log(expected_result);
        privateBitstamp.sell(amount,price,function(err,result){
            console.log("BitstampSell: "+JSON.stringify(result));
        });
    };

    // TODO change this to have a callback pass through available
    // so we can track the status of orders, store order-ids etc
    if(config.get('GlobalSettings.ALL_TRADING_ENABLED') && config.get('Exchange.Bitstamp.trading_enabled')) {
        this.processOrder = function(order) {
            // TODO validate order.getExchangeId() == this.exchangeId
            if(order.isBuyOrder()) {
                return buy(order.getPrice().toString(),order.getAmount().toString());
            }
            if(order.isSellOrder()) {
                return sell(order.getPrice().toString(),order.getAmount().toString());
            }
        };
    } else {
        this.processOrder = function(order) {
            console.log(order.serialize());
        };
    }

    if(config.util.getEnv('NODE_ENV')=='production') {
        this.getBalance = function(Balance,resultCallback){
            privateBitstamp.balance(function(err,result){
                resultCallback(err,new Balance({
                    exchangeId: exchangeId,
                    usd_avail: result.usd_available,
                    btc_avail: result.btc_available
                }));
            });
        };
    } else {
        this.getBalance = function(Balance,resultCallback){
            return resultCallback(null,new Balance({
                exchangeId: exchangeId,
                usd_avail: Math.random()*1000,
                btc_avail: Math.random()*8
            }));
        };
    }

    this.noTrade = function(book) {
        return name+' (['+book.bid.amount.set_precision(4).toString()+','+book.bid.price.set_precision(4).toString()+']['+book.ask.amount.set_precision(4).toString()+','+book.ask.price.set_precision(4).toString()+'])';
    };

    this.getName = function() { return name;};

    this.getExchangeId = function() {return exchangeId;};

    this.getFee = function(){ return fee; };
};

module.exports = exports = BitstampExchange;