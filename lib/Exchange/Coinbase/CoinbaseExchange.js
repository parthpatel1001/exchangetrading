import {BuyOrder} from '../../Order/BuyOrder';
import {SellOrder} from '../../Order/SellOrder';
import {Balance} from '../../Balance/Balance';
import {ExchangeBase} from '../ExchangeBase'
import config from 'config';
import async from 'async';
import num from 'num';
import CoinbaseExchangeClient from 'coinbase-exchange';


let name = 'Coinbase',
    exchangeId = config.get('Exchange.Coinbase.id'),
    key = config.get('Exchange.Coinbase.key'),
    secret = config.get('Exchange.Coinbase.b4secret'),
    passphrase = config.get('Exchange.Coinbase.passphrase'),
    fee = config.get('Exchange.Coinbase.trade_fee');
let authedClient = new CoinbaseExchangeClient.AuthenticatedClient(key,secret,passphrase);

let buy = (price,amount) => {
    let expected_result = name+'(BUY '+amount+','+price+')';
    console.log('CoinbaseExchange buy had expected result of', expected_result);
    authedClient.buy({
        'price' : price,
        'size': amount,
        'product_id' : 'BTC-USD'
    },(err,response,data) => {
        if(err) {
            console.log('CoinbaseExchange buy\'s response had an error', err);
        }
        console.log('CoinbaseExchange\'s buy response', data);
    });

    return true;
};

let sell = (price,amount) => {
    let expected_result = name+'(SELL,'+amount+','+price+')';
    console.log('CoinbaseExchange sell had expected result of', expected_result);
    authedClient.sell({
        'price' : price,
        'size': amount,
        'product_id' : 'BTC-USD'
    },(err,response,data) =>{
        if(err) {
            console.log('CoinbaseExchange sell\'s response had an error', err);
        }
        console.log('CoinbaseExchange\'s sell response', data);
    });

    return true;
};

export class CoinbaseExchange extends ExchangeBase {
    constructor() {
        super(name, exchangeId, fee);

        if(config.get('GlobalSettings.ALL_TRADING_ENABLED') && config.get('Exchange.Coinbase.trading_enabled')) {
            this.processOrder = (order) => {
                if(order instanceof BuyOrder) {
                    return buy(order.Price.toString(), order.Amount.toString());
                }
                if(order instanceof SellOrder) {
                    return sell(order.Price.toString(), order.Amount.toString());
                }
            };
        } else {
            this.processOrder = (order) => {
                console.log('Coinbase NO TRADING ProcessOrder', order.serialize());
                return false;
            };
        }

        // TODO change this to have a callback pass through available
        // so we can track the status of orders, store order-ids etc
        if(config.util.getEnv('NODE_ENV')=='production') {
            this.getBalance = (resultCallback) => {
                async.parallel([
                    (callback) => {
                        authedClient.getAccount(config.get('Exchange.Coinbase.usd_account_id'),(err,response,data) => {
                            callback(err,data);
                        });
                    },
                    (callback) => {
                        authedClient.getAccount(config.get('Exchange.Coinbase.bitcoin_account_id'),(err,response,data) => {
                            callback(err,data);
                        });
                    }
                ],(err,results) => {
                    let newBal = new Balance(this.ExchangeId, results[0].available, results[1].available);
                    resultCallback(err, newBal);
                });
            };
            this.getOpenOrders = (resultCallBack) => {
                //return resultCallBack('here');
                authedClient.getOrders((err,response,data) => {
                    var open_orders = [];
                    for (var i in data) {
                        if(data[i].status == 'open') {
                            open_orders.push(data[i]);
                        }
                    }
                    return resultCallBack(open_orders);
                });
            };

            this.cancelOrder = (orderId, callback) => {
                authedClient.cancelOrder(orderId,callback);
            };
        } else {
            this.getBalance = (resultCallback) => {
                let newBal = new Balance(this.ExchangeId, Math.random()*1000, Math.random()*8);
                resultCallback(null, newBal);
            };
            this.getOpenOrders = (resultCallback) => {
                // TODO dont be lazy and add some fake shit here
                return resultCallback([]);
            };
        }
    }

    static noTrade(book) {
        return name+' (['+book.bid.amount.set_precision(4).toString()+','+book.bid.price.set_precision(4).toString()+']['+book.ask.amount.set_precision(4).toString()+','+book.ask.price.set_precision(4).toString()+'])';
    };
}
