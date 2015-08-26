import num from 'num';
import config from 'config';
import {OrderFactory} from './OrderFactory.js';

let MAX_TRADE_AMOUNT = config.get('TradeThresholds.MAX_TRADE_AMOUNT');

let getSafetyAmount = (buyPrice) => {
    //randomOffset so other bots don't see a pattern evolving out of our order flow
    var randomOffset = Math.random();
    return num(MAX_TRADE_AMOUNT + randomOffset).set_precision(6).div(num(buyPrice).set_precision(6));
};

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
        var safety = getSafetyAmount(price1);
        amount = Math.min(amount,safety);
        this.OrderPublisher.publishLinkedOrders(
            // TODO: Build out Order Id which is null for now
            // use uuid https://github.com/broofa/node-uuid
            OrderFactory.createBuyOrderParsed(null,price1,amount,exs[0]),
            OrderFactory.createSellOrderParsed(null,price2,amount,exs[1])
        );
    }

    noOrder(books, dirMaths)
    {
        console.log('No trade dir maths: ' + dirMaths.join(", "));
    }

    err(error)
    {
        console.log('Invalid book '+JSON.stringify(error));
    }
}
