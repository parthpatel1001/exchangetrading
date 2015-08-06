import num from 'num';
import config from 'config';
import {OrderBook} from '../OrderBook/OrderBook'
import {PriceAmount} from '../OrderBook/PriceAmount'

let threshold = num(config.get('TradeThresholds.COINBASE_BITSTAMP_ARB_THRESHOLD'));

/**
 * Right now only looks at the first two orderbooks
 * orderbook top is an array:
 [{
        bid: { price: [Object], amount: [Object] },
        ask: { price: [Object], amount: [Object] }
     },{
        bid: { price: [Object], amount: [Object] },
        ask: { price: [Object], amount: [Object] }
     }]
 *
 * @param orderBookTop
 * @param generateOrderCallback
 * @param noTradeCallback
 * @param invalidBookCallBack
 */
let getArbOpportunities = (orderBookTop, callbackObj, generateOrderFuncName, noTradeFuncName, invalidBookFuncName) => {
    let book1 = orderBookTop[0],
        book2 = orderBookTop[1];

    if(orderBookTop.length < 2 || !book1 || !book2 || !(book1 instanceof OrderBook) || !(book2 instanceof OrderBook)) {
        return callbackObj[invalidBookFuncName](orderBookTop);
    }

    var dir1 = book2.Bid.Price.sub(book1.Ask.Price).div(book1.Ask.Price);
    if(dir1.cmp(threshold) === 1)
    {
        let amount = num(Math.min(book2.Bid.Amount,book1.Ask.Amount));
        if(amount.cmp(.01)===1) {
            // buy on ex0 sell on ex1
            return callbackObj[generateOrderFuncName](
                [book1.Exchange, book2.Exchange],
                book1.Ask.Price,
                book2.Bid.Price,
                amount
            );
        }
    }

    var dir2 = book1.Bid.Price.sub(book2.Ask.Price).div(book2.Ask.Price);
    if(dir2.cmp(threshold) === 1)
    {
        let amount = num(Math.min(book1.Bid.Amount, book2.Ask.Amount));
        if(amount.cmp(.01)===1) {
            // buy on ex1 sell on ex0
            return callbackObj[generateOrderFuncName](
                [book2.Exchange, book1.Exchange],
                book2.Ask.Price,
                book1.Bid.Price,
                amount
            );
        }
    }

    return callbackObj[noTradeFuncName](book1,book2,dir1,dir2);
};

export class Arbiter {
    constructor(orderGenerator)
    {
        this.OrderGenerator = orderGenerator;
    };

    subscribeTo2ExchangeArbOpportunities(bookTop) {
        return getArbOpportunities(
            bookTop,
            this.OrderGenerator,
            'generateOrder',
            'noOrder',
            'err'
        );
    };
}
