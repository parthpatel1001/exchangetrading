/**
 * Created by parthpatel1001 on 5/9/15.
 */
var CoinbaseExchangeClient = require('coinbase-exchange');
var config = require('config');
var async = require('async');
var num = require('num');

var CoinbaseExchange = function(exchangeId) {

    var name = 'Coinbase';

    var key = config.get('Exchange.Coinbase.key');
    var secret = config.get('Exchange.Coinbase.b4secret');
    var passphrase = config.get('Exchange.Coinbase.passphrase');
    var fee = num(config.get('Exchange.Coinbase.trade_fee'));

    var authedClient = new CoinbaseExchangeClient.AuthenticatedClient(key,secret,passphrase);
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

    if(config.get('GlobalSettings.ALL_TRADING_ENABLED') && config.get('Exchange.Coinbase.trading_enabled')) {
        this.processOrder = function(order) {
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

    // TODO change this to have a callback pass through available
    // so we can track the status of orders, store order-ids etc
    if(config.util.getEnv('NODE_ENV')=='production') {
        this.getBalance = function(Balance,resultCallback){
            async.parallel([
                function(callback){
                    authedClient.getAccount(config.get('Exchange.Coinbase.usd_account_id'),function(err,response,data){
                        callback(err,data);
                    });
                },
                function(callback){
                    authedClient.getAccount(config.get('Exchange.Coinbase.bitcoin_account_id'),function(err,response,data){
                        callback(err,data);
                    });
                }
            ],function(err,results){
                resultCallback(err,new Balance({
                    exchangeId: exchangeId,
                    usd_avail: results[0].available,
                    btc_avail: results[1].available
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

module.exports = exports = CoinbaseExchange;