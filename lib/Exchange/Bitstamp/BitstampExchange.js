import {Balance} from '../../Balance/Balance';
import {ExchangeBase} from '../ExchangeBase'
import config from 'config';
import num from 'num';
import Bitstamp from 'bitstamp';

let name = 'Bitstamp',
    exchangeId = config.get('Exchange.Bitstamp.id'),
    key = config.get('Exchange.Bitstamp.key'),
    secret = config.get('Exchange.Bitstamp.secret'),
    clientId = config.get('Exchange.Bitstamp.clientId'),
    privateBitstamp = new Bitstamp(key,secret,clientId),
    fee = num(config.get('Exchange.Bitstamp.trade_fee'));

let buy = (price,amount) => {
    let expected_result = name+'(BUY '+amount+','+price+')';
    console.log('BitstampExchange buy had expected result of', expected_result);
    privateBitstamp.buy(amount,price,function(err,result){
        console.log("BitstampBuy: "+JSON.stringify(result));
    });
};

let sell = function(price,amount){
    let expected_result =  name+'(SELL,'+amount+','+price+')';
    console.log('BitstampExchange sell had expected result of', expected_result);
    privateBitstamp.sell(amount,price,function(err,result){
        console.log("BitstampSell: "+JSON.stringify(result));
    });
};

export class BitstampExchange extends ExchangeBase {
    constructor() {
        super(name, exchangeId, fee);

        // TODO change this to have a callback pass through available
        // so we can track the status of orders, store order-ids etc
        if(config.get('GlobalSettings.ALL_TRADING_ENABLED') && config.get('Exchange.Bitstamp.trading_enabled')) {
            this.processOrder = (order) => {
                // TODO validate order.ExchangeId == this.ExchangeId
                if(order.isBuyOrder()) {
                    return buy(order.getPrice().toString(),order.getAmount().toString());
                }
                if(order.isSellOrder()) {
                    return sell(order.getPrice().toString(),order.getAmount().toString());
                }
            };
        } else {
            this.processOrder = (order) => {
                console.log('Bitstamp NO TRADING ProcessOrder', order.serialize());
            };
        }

        if(config.util.getEnv('NODE_ENV')=='production') {
            this.getBalance = (resultCallback) => {
                privateBitstamp.balance(function(err,result){
                    resultCallback(err,new Balance({
                        exchangeId: this.ExchangeId,
                        usd_avail: result.usd_available,
                        btc_avail: result.btc_available
                    }));
                });
            };
        } else {
            this.getBalance = (resultCallback) => {
                return resultCallback(null,new Balance({
                    exchangeId: this.ExchangeId,
                    usd_avail: Math.random()*1000,
                    btc_avail: Math.random()*8
                }));
            };
        }
    }

    noTrade(book) {
        return name+' (['+book.bid.amount.set_precision(4).toString()+','+book.bid.price.set_precision(4).toString()+']['+book.ask.amount.set_precision(4).toString()+','+book.ask.price.set_precision(4).toString()+'])';
    };
}
