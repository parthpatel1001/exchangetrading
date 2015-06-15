import {Balance} from '../../Balance/Balance';
import config from 'config';
import async from 'async';
import num from 'num';
import CoinbaseExchangeClient from 'coinbase-exchange';

let name = 'Coinbase',
    exchangeId = config.get('Exchange.Coinbase.id'),
    key = config.get('Exchange.Coinbase.key'),
    secret = config.get('Exchange.Coinbase.b4secret'),
    passphrase = config.get('Exchange.Coinbase.passphrase'),
    fee = num(config.get('Exchange.Coinbase.trade_fee'));
let authedClient = new CoinbaseExchangeClient.AuthenticatedClient(key,secret,passphrase);

let buy = function(price,amount){
    var expected_result = name+'(BUY '+amount+','+price+')';
    console.log('CoinbaseExchange buy had expected result of', expected_result);
    authedClient.buy({
        'price' : price,
        'size': amount,
        'product_id' : 'BTC-USD'
    },function(err,response,data){
        if(err) {
            console.log('CoinbaseExchange buy\'s response had an error', err);
        }
        console.log('CoinbaseExchange\'s buy response', data);
    });
};

let sell = function(price,amount){
    var expected_result = name+'(SELL,'+amount+','+price+')';
    console.log('CoinbaseExchange sell had expected result of', expected_result);
    authedClient.sell({
        'price' : price,
        'size': amount,
        'product_id' : 'BTC-USD'
    },function(err,response,data){
        if(err) {
            console.log('CoinbaseExchange sell\'s response had an error', err);
        }
        console.log('CoinbaseExchange\'s sell response', data);
    });
};

export class CoinbaseExchange {
    constructor() {
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
                console.log('Coinbase NO TRADING ProcessOrder', order.serialize());
            };
        }

        // TODO change this to have a callback pass through available
        // so we can track the status of orders, store order-ids etc
        if(config.util.getEnv('NODE_ENV')=='production') {
            this.getBalance = function(resultCallback){
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
            this.getBalance = function(resultCallback){
                return resultCallback(null,new Balance({
                    exchangeId: exchangeId,
                    usd_avail: Math.random()*1000,
                    btc_avail: Math.random()*8
                }));
            };
        }
    }

    noTrade(book) {
        return name+' (['+book.bid.amount.set_precision(4).toString()+','+book.bid.price.set_precision(4).toString()+']['+book.ask.amount.set_precision(4).toString()+','+book.ask.price.set_precision(4).toString()+'])';
    };

    getName() { return name;};

    getExchangeId() {return exchangeId;};

    getFee(){ return fee; };
}
