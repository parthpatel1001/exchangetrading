import num from 'num';
import config from 'config';
import {Order} from './Order.js';

let MAX_TRADE_AMOUNT = config.get('TradeThresholds.MAX_TRADE_AMOUNT');

let createBuyOrder = function(exId,price,amount) {
    return new Order({
        orderType: 'BUY', // TODO move this shit
        exchangeId: exId,
        price: price,
        amount: amount
    });
};

let createSellOrder = function(exId,price,amount) {
    return new Order({
        orderType: 'SELL', // TODO move this shit
        exchangeId: exId,
        price: price,
        amount: amount
    });
};

export class OrderGenerator {
    constructor(OrderPublisherIn){
        this.OrderPublisher = OrderPublisherIn;

        this.generateOrder = (exs, price1, price2, amount) => {
            // dont take the risk of buying too many btc
            var safety = num(MAX_TRADE_AMOUNT).set_precision(6).div(num(price1).set_precision(6));
            amount = Math.min(amount,safety);
            this.OrderPublisher.publishLinkedOrders(
                createBuyOrder(exs[0],price1,amount),
                createSellOrder(exs[1],price2,amount)
            );
        }
    }

    noOrder(book1,book2,dir1,dir2)
    {
        console.log('No trade d1: '+dir1.toString()+" d2: "+dir2.toString());
        //if(book1 !== undefined && book2 !== undefined) {
        //    console.log(ex1.noTrade(book1)+" "+ex2.noTrade(book2));
        //}
    }

    err(error)
    {
        console.log('Invalid book '+JSON.stringify(error));
    }
}
