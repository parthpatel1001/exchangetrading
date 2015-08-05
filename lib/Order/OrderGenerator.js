import num from 'num';
import config from 'config';
import {OrderFactory} from './OrderFactory.js';
let MAX_TRADE_AMOUNT = config.get('TradeThresholds.MAX_TRADE_AMOUNT');

export class OrderGenerator {
    /**
     *
     * @param {OrderPublisher} OrderPublisherIn
     */
    constructor(OrderPublisherIn){
        this.OrderPublisher = OrderPublisherIn;
    }

    generateOrder (exs, price1, price2, amount) {
        // dont take the risk of buying too many btc
        var safety = this.getSafetyAmount(price1);
        amount = Math.min(amount,safety);
        this.OrderPublisher.publishLinkedOrders(
            // TODO: Build out Order Id which is null for now
            // use uuid https://github.com/broofa/node-uuid
            OrderFactory.createBuyOrder({id:null,price:price1,amount:amount,exchange:exs[0]}),
            OrderFactory.createSellOrder({id:null,price:price2,amount:amount,exchange:exs[1]})
        );
    }

    getSafetyAmount(buyPrice) {
        //randomOffset so other bots don't see a pattern evolving out of our order flow
        var randomOffset = Math.random();
        return num(MAX_TRADE_AMOUNT + randomOffset).set_precision(6).div(num(buyPrice).set_precision(6));
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
