var Bitstamp = require('bitstamp'),
    config = require('config'),
    num = require('num'),
    Balance = require('../../Balance/Balance.js');


var BitstampExchange = function() {
    var name = 'Bitstamp',
        exchangeId = config.get('Exchange.Bitstamp.id'),
        key = config.get('Exchange.Bitstamp.key'),
        secret = config.get('Exchange.Bitstamp.secret'),
        clientId = config.get('Exchange.Bitstamp.clientId'),
        privateBitstamp = new Bitstamp(key,secret,clientId),
        fee = num(config.get('Exchange.Bitstamp.trade_fee'));

    /**
     * Bitstamp api wants price numbers to have 7 digits max
     * Limit decimals to 4
     * @type {number}
     */
    var MAX_PRICE_DECIMAL_PLACES = 2;

    var buy =  function(price,amount){
        var expected_result = name+'(BUY '+amount+','+price+')';
        console.log('BitstampExchange buy had expected result of', expected_result);
        privateBitstamp.buy(amount,price,function(err,result){
        console.log("BitstampBuy: "+JSON.stringify(result));
        });
    };

    var sell = function(price,amount){
        var expected_result =  name+'(SELL,'+amount+','+price+')';
        console.log('BitstampExchange sell had expected result of', expected_result);
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
                return buy(order.getPrice().set_precision(MAX_PRICE_DECIMAL_PLACES).toString(),order.getAmount().toString());
            }
            if(order.isSellOrder()) {
                return sell(order.getPrice().set_precision(MAX_PRICE_DECIMAL_PLACES).toString(),order.getAmount().toString());
            }
        };
    } else {
        this.processOrder = function(order) {
            console.log('Bitstamp NO TRADING ProcessOrder', order.serialize());
        };
    }

    if(config.util.getEnv('NODE_ENV')=='production') {
        this.getBalance = function(resultCallback){
            privateBitstamp.balance(function(err,result){
                resultCallback(err,new Balance({
                    exchangeId: exchangeId,
                    usd_avail: result.usd_available,
                    btc_avail: result.btc_available
                }));
            });
        };
    } else {
        this.getBalance = function(resultCallback){
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