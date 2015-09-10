import {Balance} from '../../Balance/Balance';
import {ExchangeBase} from '../ExchangeBase'
import {BuyOrder} from '../../Order/BuyOrder';
import {SellOrder} from '../../Order/SellOrder';
import config from 'config';
import num from 'num';
import Bitfinex from 'bitfinex-promise';

let name = 'bitfinex',
    exchangeId = config.get('Exchange.BitFinEx.id'),
    key = config.get('Exchange.BitFinEx.key'),
    secret = config.get('Exchange.BitFinEx.secret'),
    fee = config.get('Exchange.BitFinEx.trade_fee'),
    privateBitFinEx = new Bitfinex(key,secret);

let type = 'limit';
// TODO: Is the above right?
// From API Docs: Either "market" / "limit" / "stop" / "trailing-stop" / "fill-or-kill" / "exchange market" / "exchange limit" / "exchange stop" / "exchange trailing-stop" / "exchange fill-or-kill". (type starting by "exchange " are exchange orders, others are margin trading orders)
// Also described here: https://www.bitfinex.com/pages/features

let symbol = 'btcusd';
// TODO: Is the above right?
// From Docs: Currently "btcusd", "ltcusd", "ltcbtc".

/**
 * Limit decimals to 4
 * @type {number}
 */
let MAX_PRICE_DECIMAL_PLACES = 2;

let buy = (price,amount) => {
    let expected_result = name+'(BUY '+amount+','+price+')';
    console.log('BitFinExExchange buy had expected result of', expected_result);

    privateBitFinEx.newOrder(symbol, amount, price, this.Name, 'BUY', type)
        .then((results) => {
            console.log('BitFinEx new buy order responded with', results);
        })
        .catch((e) => {
            console.log('BitFinEx new buy order errored with', e);
        });

    return true;
};

let sell = (price,amount) => {
    let expected_result =  name+'(SELL,'+amount+','+price+')';
    console.log('BitFinExExchange sell had expected result of', expected_result);
    privateBitFinEx.newOrder(symbol, amount, price, this.Name, 'SELL', type)
        .then((results) => {
            console.log('BitFinEx new buy order responded with', results);
        })
        .catch((e) => {
            console.log('BitFinEx new buy order errored with', e);
        });
    return true;
};

export class BitFinExExchange extends ExchangeBase {
    constructor() {
        super(name, exchangeId, fee);

        // TODO change this to have a callback pass through available
        // so we can track the status of orders, store order-ids etc
        if(config.get('GlobalSettings.ALL_TRADING_ENABLED') && config.get('Exchange.BitFinEx.trading_enabled')) {
            this.processOrder = (order) => {
                // TODO validate order.ExchangeId == this.ExchangeId
                if(order instanceof BuyOrder) {
                    return buy(order.Price.set_precision(MAX_PRICE_DECIMAL_PLACES).toString(),order.Amount.toString());
                }
                if(order instanceof SellOrder) {
                    return sell(order.Price.set_precision(MAX_PRICE_DECIMAL_PLACES).toString(),order.Amount.toString());
                }
            };
        }

        if(config.util.getEnv('NODE_ENV')=='production') {
            this.getBalance = (resultCallback) => {
                privateBitFinEx.balances((err,result) =>{

                    console.log('bitFinEx balances', err, result);
                    //let newBal = new Balance(this.ExchangeId, result.usd_available, result.btc_available);
                    //resultCallback(err, newBal);
                });
            };
        }
    }
}
