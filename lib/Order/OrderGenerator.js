import num from 'num';
import config from 'config';
import {BuyOrder} from './BuyOrder';
import {SellOrder} from './SellOrder';

let MAX_TRADE_AMOUNT = config.get('TradeThresholds.MAX_TRADE_AMOUNT');

let createBuyOrder = function(price,amount, exchange) {
    // TODO: Build out Order Id which is null for now
    return new BuyOrder(null, price, amount, exchange);
};

let createSellOrder = function(price,amount, exchange) {
    // TODO: Build out Order Id which is null for now
    return new SellOrder(null, price, amount, exchange);
};

export class OrderGenerator {
    constructor(OrderPublisherIn){
        this.OrderPublisher = OrderPublisherIn;

        this.generateOrder = (exs, price1, price2, amount) => {
            // dont take the risk of buying too many btc
            var safety = this.getSafetyAmount(price1);
            amount = Math.min(amount,safety);
            this.OrderPublisher.publishLinkedOrders(
                createBuyOrder(price1, amount, exs[0]),
                createSellOrder(price2, amount, exs[1])
            );
        }
    }
    
    getSafetyAmount(buyPrice) {
        return num(MAX_TRADE_AMOUNT).set_precision(6).div(num(buyPrice).set_precision(6));
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
