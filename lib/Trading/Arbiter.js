import num from 'num';
import config from 'config';

let numifyBook = function(book) { // TODO: Pretty sure this is wrong / maybe not needed thanks to OrderBook class and hmset
    console.log('numifyBook', book);
    return {
        bid: {
            price: num(book.bid.price),
            amount: num(book.bid.amount)
        },
        ask: {
            price: num(book.ask.price),
            amount: num(book.ask.amount)
        },
        exchangeId: book.exchangeId
    };
};

let threshold = config.get('TradeThresholds.COINBASE_BITSTAMP_ARB_THRESHOLD');

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
 * @param callback
 * @param noTradeCallback
 * @param invalidBookCallBack
 */
let getArbOpportunities = function(orderBookTop,callback,noTradeCallback,invalidBookCallBack)
{
    var book1 = orderBookTop[0],
        book2 = orderBookTop[1];

    if(orderBookTop.length < 2 || !book1 || !book2) {
        return invalidBookCallBack(orderBookTop);
    }

    book1 = numifyBook(book1);
    book2 = numifyBook(book2);

    var amount = num(0);

    var dir1 = book2.bid.price.sub(book1.ask.price).div(book1.ask.price);
    // book1.ask.price = 400
    // book2.bid.price = 5000
    if(dir1.cmp(threshold) === 1)
    {
        amount = num(Math.min(book2.bid.amount,book1.ask.amount));
        if(amount.cmp(.01)===1) {
            // buy on ex0 sell on ex1
            return callback(
                [book1.exchange, book2.exchange],
                book1.ask.price,
                book2.bid.price,
                amount
            );
        }
    }

    var dir2 = book1.bid.price.sub(book2.ask.price).div(book2.ask.price);
    // book1.bid.price = 5000
    // book2.ask.price = 400
    if(dir2.cmp(threshold) === 1)
    {
        amount = num(Math.min(book1.bid.amount, book2.ask.amount));
        if(amount.cmp(.01)===1) {
            // buy on ex1 sell on ex0
            return callback(
                [book2.exchange, book1.exchange],
                book2.ask.price,
                book1.bid.price,
                amount
            );
        }
    }

    return noTradeCallback(book1,book2,dir1,dir2);
};

export class Arbiter {
    constructor(OrderGeneratorIn)
    {
        this.OrderGenerator = OrderGeneratorIn;
    };

    subscribeTo2ExchangeArbOpportunities(bookTop) {
        return getArbOpportunities(bookTop,this.OrderGenerator.generateOrder,this.OrderGenerator.noOrder,this.OrderGenerator.err);
    };
}
