var num = require('num'),
    Order = require('./Order.js'),
    config = require('config');

var OrderGenerator = function(){
    var MAX_TRADE_AMOUNT = config.get('TradeThresholds.MAX_TRADE_AMOUNT'),
        OrderPublisher;

    this.createBuyOrder = function(exId,price,amount) {
        return new Order({
            orderType: 'BUY', // TODO move this shit
            exchangeId: exId,
            price: price,
            amount: amount
        });
    };
    this.createSellOrder = function(exId,price,amount) {
        return new Order({
            orderType: 'SELL', // TODO move this shit
            exchangeId: exId,
            price: price,
            amount: amount
        });
    };
    var self = this;

    this.registerOrderPublisher = function(OrderPublisherIn){
        OrderPublisher = OrderPublisherIn;
    };

    this.getSafetyAmount = function(buyPrice) {
        return num(MAX_TRADE_AMOUNT).set_precision(6).div(num(buyPrice).set_precision(6));
    }

    this.generateOrder = function(exs,price1,price2,amount)
    {
        // dont take the risk of buying too many btc
        var safety = this.getSafetyAmount(price1);
        amount = Math.min(amount,safety);
        OrderPublisher.publishLinkedOrders(
            self.createBuyOrder(exs[0],price1,amount),
            self.createSellOrder(exs[1],price2,amount)
        );
    };

    this.noOrder = function(book1,book2,dir1,dir2)
    {
        console.log('No trade d1: '+dir1.toString()+" d2: "+dir2.toString());
        //if(book1 !== undefined && book2 !== undefined) {
        //    console.log(ex1.noTrade(book1)+" "+ex2.noTrade(book2));
        //}
    };

    this.err = function(error)
    {
        console.log('Invalid book '+JSON.stringify(error));
    };
};

module.exports = exports = OrderGenerator;