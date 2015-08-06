import {Balance} from '../../Balance/Balance';
import {ExchangeBase} from '../ExchangeBase'
import {BuyOrder} from '../../Order/BuyOrder';
import {SellOrder} from '../../Order/SellOrder';
import config from 'config';
import num from 'num';
import Bitstamp from 'bitstamp';

let name = 'Bitstamp',
    exchangeId = config.get('Exchange.Bitstamp.id'),
    key = config.get('Exchange.Bitstamp.key'),
    secret = config.get('Exchange.Bitstamp.secret'),
    clientId = config.get('Exchange.Bitstamp.clientId'),
    privateBitstamp = new Bitstamp(key,secret,clientId),
    fee = config.get('Exchange.Bitstamp.trade_fee');

/**
 * Bitstamp api wants price numbers to have 7 digits max
 * Limit decimals to 4
 * @type {number}
 */
let MAX_PRICE_DECIMAL_PLACES = 2;

let buy = (price,amount) => {
    let expected_result = name+'(BUY '+amount+','+price+')';
    console.log('BitstampExchange buy had expected result of', expected_result);
    privateBitstamp.buy(amount,price,function(err,result){
        console.log("BitstampBuy: "+JSON.stringify(result));
    });
    return true;
};

let sell = function(price,amount){
    let expected_result =  name+'(SELL,'+amount+','+price+')';
    console.log('BitstampExchange sell had expected result of', expected_result);
    privateBitstamp.sell(amount,price,function(err,result){
        console.log("BitstampSell: "+JSON.stringify(result));
    });
    return true;
};

export class BitstampExchange extends ExchangeBase {
    constructor() {
        super(name, exchangeId, fee);

        // TODO change this to have a callback pass through available
        // so we can track the status of orders, store order-ids etc
        if(config.get('GlobalSettings.ALL_TRADING_ENABLED') && config.get('Exchange.Bitstamp.trading_enabled')) {
            this.processOrder = (order) => {
                // TODO validate order.ExchangeId == this.ExchangeId
                if(order instanceof BuyOrder) {
                    return buy(order.Price.set_precision(MAX_PRICE_DECIMAL_PLACES).toString(),order.Amount.toString());
                }
                if(order instanceof SellOrder) {
                    return sell(order.Price.set_precision(MAX_PRICE_DECIMAL_PLACES).toString(),order.Amount.toString());
                }
            };
        } else {
            this.processOrder = (order) => {
                console.log('Bitstamp NO TRADING ProcessOrder', order.serialize());
                return false;
            };
        }

        if(config.util.getEnv('NODE_ENV')=='production') {
            this.getBalance = (resultCallback) => {
                privateBitstamp.balance((err,result) =>{
                    let newBal = new Balance(this.ExchangeId, result.usd_available, result.btc_available);
                    resultCallback(err, newBal);
                });
            };
        } else {
            this.getBalance = (resultCallback) => {
                let newBal = new Balance(this.ExchangeId, Math.random()*1000, Math.random()*8);
                resultCallback(null, newBal);
            };
        }
    }

    noTrade(book) {
        return name+' (['+book.bid.amount.set_precision(4).toString()+','+book.bid.price.set_precision(4).toString()+']['+book.ask.amount.set_precision(4).toString()+','+book.ask.price.set_precision(4).toString()+'])';
    };
}
