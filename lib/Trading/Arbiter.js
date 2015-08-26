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
    let checkOrderBook = (ob) => {
        let len = orderBookTop.length;
        if(len < 2) {
            console.log('not enough books');
            return false;
        }
        for(let book of ob) {
            if(!book || !(book instanceof OrderBook)){
                console.log('found a bad book');
                return false;
            }
        }
        return true;
    };

    let checkBooksForArb = (left, right, math) => {
        math = left.Bid.Price.sub(right.Ask.Price).div(right.Ask.Price);
        if(math.cmp(threshold) === 1)
        {
            let amount = num(Math.min(left.Bid.Amount,right.Ask.Amount));
            if(amount.cmp(.01)===1) {
                return amount;
            }
        }
        return null;
    };

    let book1 = orderBookTop[0],
        book2 = orderBookTop[1];

    if(!checkOrderBook(orderBookTop)) {
        return callbackObj[invalidBookFuncName](orderBookTop);
    }

    let math1 = null, math2 = null;
    let amount = checkBooksForArb(book2, book1, math1);
    if(amount) {
        return callbackObj[generateOrderFuncName](
            [book1.Exchange, book2.Exchange],
            book1.Ask.Price,
            book2.Bid.Price,
            amount
        );
    }

    amount = checkBooksForArb(book1, book2, math2);
    if(amount) {
        return callbackObj[generateOrderFuncName](
            [book2.Exchange, book1.Exchange],
            book2.Ask.Price,
            book1.Bid.Price,
            amount
        );
    }

    return callbackObj[noTradeFuncName](book1,book2, math1, math2);
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
