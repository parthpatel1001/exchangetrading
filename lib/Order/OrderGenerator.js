import num from 'num';
import config from 'config';
import {Notification, NotificationLevels} from '../Notification';
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

        Notification.eventTriggered("OrderGenerator.generateOrder", {
            price1: price1,
            price2: price2,
            amount: amount,
            exchange1: exs[0].Name,
            exchange2: exs[1].Name
        }, "", NotificationLevels.HIGH);

        this.OrderPublisher.publishLinkedOrders(
            // TODO: Build out Order Id which is null for now
            // use uuid https://github.com/broofa/node-uuid
            OrderFactory.createBuyOrderParsed(null,price1,amount,exs[0]),
            OrderFactory.createSellOrderParsed(null,price2,amount,exs[1])
        );
    }

    noOrder(books, dirMaths)
    {
        Notification.eventTriggered("OrderGenerator.noOrder", {
            dirMaths: dirMaths.join(", ")
        }, "", NotificationLevels.MEDIUM);

        console.log('No trade dir maths: ' + dirMaths.join(", "));
    }

    err(error)
    {
        Notification.eventTriggered("OrderGenerator.error", { "Error Message": JSON.stringify(error) }, "", NotificationLevels.HIGH);

        console.log('Invalid book '+JSON.stringify(error));
    }
}
