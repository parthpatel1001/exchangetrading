import num from 'num';
import config from 'config';
import {OrderBook} from '../OrderBook/OrderBook'
import {PriceAmount} from '../OrderBook/PriceAmount'
// TODO: I hate that this is needed... Remove it and the other part marked with TODO asap
import {CoinbaseExchange} from '../Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from '../Exchange/Bitstamp/BitstampExchange';

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

    let exchange = null; // TODO: We need a better way to do this...
    if(book1.exchangeId == 0) {
        exchange = new CoinbaseExchange();
    } else {
        exchange = new BitstampExchange();
    }

    book1 = new OrderBook(
        new PriceAmount(book1.bid.price, book1.bid.amount),
        new PriceAmount(book1.ask.price, book1.ask.amount),
        exchange
    );

    if(book1.exchangeId == 0) {
        exchange = new CoinbaseExchange();
    } else {
        exchange = new BitstampExchange();
    }
    book2 = new OrderBook(
        new PriceAmount(book2.bid.price, book2.bid.amount),
        new PriceAmount(book2.ask.price, book2.ask.amount),
        exchange
    );

    var dir1 = book2.Bid.Price.sub(book1.Ask.Price).div(book1.Ask.Price);
    if(dir1.cmp(threshold) === 1)
    {
        let amount = num(Math.min(book2.Bid.Amount,book1.Ask.Amount));
        if(amount.cmp(.01)===1) {
            // buy on ex0 sell on ex1
            return callback(
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
            return callback(
                [book2.Exchange, book1.Exchange],
                book2.Ask.Price,
                book1.Bid.Price,
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
