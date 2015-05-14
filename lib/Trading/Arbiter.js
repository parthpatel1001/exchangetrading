/**
 * Created by parthpatel1001 on 5/9/15.
 */
var num = require('num');
var Arbiter = function(threshold,ExchangeManager, Trader) {
    var numifyBook = function(book) {
        return {
            bid: {
                price: num(book.bid.price),
                amount: num(book.bid.amount)
            },
            ask: {
                price: num(book.ask.price),
                amount: num(book.ask.amount)
            }
        };
    };
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
    var getArbOppurtunities = function(orderBookTop,callback,noTradeCallback,invalidBookCallBack)
    {
        var book1 = orderBookTop[0],
            book2 = orderBookTop[1];

        if(orderBookTop.length < 2 || !book1 || !book2) {
            return invalidBookCallBack(orderBookTop);
        }

        book1 = numifyBook(book1);
        book2 = numifyBook(book2);

        // book1.ask.price = 400
        // book2.bid.price = 5000
        if(book2.bid.price.sub(book1.ask.price).div(book1.ask.price).cmp(threshold) === 1)
        {
            // buy on ex0 sell on ex1
            return callback(
                [0,1],
                book1.ask.price,
                book2.bid.price,
                num(Math.min(book2.bid.amount,book1.ask.amount))
            );
        }

        // book1.bid.price = 5000
        // book2.ask.price = 400
        if(book1.bid.price.sub(book2.ask.price).div(book2.ask.price).cmp(threshold) === 1)
        {
            // buy on ex1 sell on ex2
            return callback(
                [1,0],
                book2.ask.price,
                book1.bid.price,
                num(Math.min(book1.bid.amount, book2.ask.amount))
            );
        }

        return noTradeCallback(book1,book2);
    };

    this.arbTwoExchanges = function (bookTop)
    {
        return getArbOppurtunities(
            bookTop,
            function (exs, price1, price2, amount) {
                return Trader.trade(
                    ExchangeManager.getExchange(exs[0]),
                    ExchangeManager.getExchange(exs[1]),
                    price1,
                    price2,
                    amount
                );
            },
            function (book1, book2) {
                return Trader.noTrade(
                    book1,
                    book2,
                    ExchangeManager.getExchange(0),
                    ExchangeManager.getExchange(1)
                );
            },
            function (err) {
                console.log('Invalid book ' + JSON.stringify(err));
            });

    }
};

module.exports = exports = Arbiter;

