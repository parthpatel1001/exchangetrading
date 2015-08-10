// TODO: this isn't used anywhere...
export class Trader {
    // buy price1 on ex1 sell price2 on ex2
    trade(ex1,ex2,price1,price2,amount)
    {
        // TODO check balance here
        // TODO set this up here
        // Async.parallel(
        // https://github.com/caolan/async#paralleltasks-callback
        var test1 = ex1.buy(price1,amount);
        var test2 = ex2.sell(price2,amount);
        var test3 = price2.mul(amount).sub(price1.mul(amount));
        var test4 = test3.div(price1).mul(100.0);
        var test5 = price1.mul(amount).add(price2.mul(amount)).mul(.0025);
        var test6 = 'Profit: ($'+test3.set_precision(4)+','+test4.set_precision(4)+'%) Fee: ($'+test5.set_precision(4).toString()+',.5%)';
        console.log('Trader.Trade Test Values', test1, test2, test6);
    };

    noTrade(book1,book2,ex1,ex2) {
        if(book1 !== undefined && book2 !== undefined) {
            console.log('Trader.noTrade', ex1.noTrade(book1), ex2.noTrade(book2));
        }
    }
}
