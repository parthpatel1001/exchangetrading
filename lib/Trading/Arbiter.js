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
 * @param callbackObj
 * @param generateOrderFuncName
 * @param noTradeFuncName
 * @param invalidBookFuncName
 */
let getArbOpportunities = (orderBookTop, callbackObj, generateOrderFuncName, noTradeFuncName, invalidBookFuncName) => {
    let maths = [];
    let maxArbObj = null, maxArbProfit = 0;

    // Function is responsible for validating the orderBookTop object that is passed in
    let checkOrderBookTop = (ob) => {
        if(ob.length < 2) {
            console.log('Not enough books');
            return false;
        }

        // TODO: Potential speed win: kill this loop and do this in the loop where we call checkBooksForArb
        //   Need to be careful about not repeatedly checking the same books tho as that will take more time...
        for(let book of ob) {
            if(!book || !(book instanceof OrderBook)){
                console.log('Found a bad book');
                return false;
            }
        }
        return true;
    };

    // Function is responsible for seeing if there's even the potential to do an arb trade
    let checkBooksForArbOpportunity = (sellToBook, buyFromBook, maths) => {
        let math = sellToBook.Bid.Price.sub(buyFromBook.Ask.Price).div(buyFromBook.Ask.Price);
        maths.push(math); // add the math value to the tracker array
        if(math.cmp(threshold) === 1)
        {
            let amount = num(Math.min(sellToBook.Bid.Amount,buyFromBook.Ask.Amount));
            if(amount.cmp(.01)===1) {
                return amount;
            }
        }
        return null;
    };

    // Function is responsible for comparing the current arb opp against the best arb opp yet seen and saving the best
    let checkAndUpdateMaxArbOpportunity = (amount, sellToBook, buyFromBook) => {
        let arbProfit = (sellToBook.Bid.Amount * sellToBook.Bid.Price) - (buyFromBook.Ask.Amount * buyFromBook.Ask.Price);
        if(arbProfit > maxArbProfit) {
            maxArbProfit = arbProfit;
            maxArbObj = {
                amount: amount,
                sellToBook: sellToBook,
                buyFromBook: buyFromBook
            };
        }
    };

    if(!orderBookTop || !checkOrderBookTop(orderBookTop)) {
        return callbackObj[invalidBookFuncName](orderBookTop);
    }

    // The dreaded N^2 loop... We can do much better than this if we insert into the OrderBookTop array smartly...
    //  Will build that out soon but going in baby steps for now
    for(let len = orderBookTop.length, outerIdx = 0; outerIdx < len; outerIdx++) {
        // Start innerIdx at outerIdx + 1 because we've already compared the cells before that on previous runs
        //  and the + 1 because we don't want to look at a buy / sell on the same exchange
        for(let innerIdx = outerIdx + 1; innerIdx < len; innerIdx++) {
            let innerBook = orderBookTop[innerIdx],
                outerBook = orderBookTop[outerIdx],
                amount = checkBooksForArbOpportunity(innerBook, outerBook, maths);
            if(amount != null) {
                checkAndUpdateMaxArbOpportunity(amount, innerBook, outerBook);
            }

            amount = checkBooksForArbOpportunity(outerBook, innerBook, maths);
            if(amount != null) {
                checkAndUpdateMaxArbOpportunity(amount, outerBook, innerBook);
            }
        }
    }

    if(maxArbObj != null) {
        return callbackObj[generateOrderFuncName](
            [maxArbObj.buyFromBook.Exchange, maxArbObj.sellToBook.Exchange],
            maxArbObj.buyFromBook.Ask.Price,
            maxArbObj.sellToBook.Bid.Price,
            maxArbObj.amount
        );
    }

    return callbackObj[noTradeFuncName](orderBookTop, maths);
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
