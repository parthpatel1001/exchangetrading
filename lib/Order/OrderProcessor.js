/**
 * Created by parthpatel1001 on 5/17/15.
 */
var async = require('async');
var config = require('config');
var num = require('num');

/**
 * Class OrderProcessor
 * Process's orders, for now only process' linked orders (orders to send to exactly 2 exchanges at once)
 * @param ExchangeManager
 * @param BalanceTracker
 * @constructor
 */
var OrderProcessor = function(ExchangeManager,BalanceTracker){
    var exchangeManager = ExchangeManager,
        balanceTracker = BalanceTracker;

    /**
     * threshold for buy orders
     * where USD balance must be greater then order * (1+threshold)
     */
    var MIN_BUY_THRESHOLD = config.get('TradeThresholds.MINIMUM_BUY_BALANCE_THRESHOLD');
    /**
     * theshold for sell orders
     * where BTC balance must be greater then order * (1+threshold)
     */
    var MIN_SELL_THRESHOLD = config.get('TradeThresholds.MINIMUM_SELL_BALANCE_THRESHOLD');

    /**
     * Check the given balance object with the thresholds from the config to make sure
     * we have enough balance to execute the provided order
     * @param balance
     * @param order
     * @param exchange
     * @returns {boolean}
     */
    var makeSureEnoughBalance = function(balance,order,exchange){
        if(order.isBuyOrder()) {
            // when buying we have to make sure we have enough for the order + fee
            var cost = order.getCost(exchange.getFee());
            return balance.getUSDAvailable().mul(1 - MIN_BUY_THRESHOLD).cmp(cost) === 1;
        }
        if(order.isSellOrder()) {
            // when selling we only have to check if we have enough BTC
            return balance.getBTCAvailable().mul(1 - MIN_SELL_THRESHOLD).cmp(order.getAmount()) === 1;
        }
        throw new Error('Bad order type: '+order.serialize());
    };

    /**
     * Adjust the balance based on the type of order
     * The fee is always taken out as USD, the balances are adjusted reflecting the fee
     * @param order
     */
    var adjustBalance = function(order,exchange) {
        var cost = order.getCost(exchange.getFee());
        if(order.isBuyOrder()) {
            balanceTracker.decrementUSDBalance(exchange,cost);
            balanceTracker.incrementBTCBalance(exchange,order.getAmount());
        }
        if(order.isSellOrder()) {
            balanceTracker.decrementBTCBalance(exchange,order.getAmount());
            balanceTracker.incrementUSDBalance(exchange,cost);
        }
    };
    /**
     * Not implemented currently
     * This will be useful for single "reallocate" orders
     * @param order
     */
    this.processOrder = function(order){
        console.log('OrderProcessor Not Implemented ProcessOrder', order.serialize());
    };

    /**
     * Process the provided two orders in parallel for (uber X hyperScale X metaData)speed
     * Only executes the orders if there is enough available balance on both exchanges
     * @param order1
     * @param order2
     */
    this.processLinkedOrder = function(order1,order2) {
        console.log("ProcessLinkedOrder Orders In: ", order1.serialize(), order2.serialize());
        var ex1 = exchangeManager.getExchange(order1.getExchangeId()),
            ex2 = exchangeManager.getExchange(order2.getExchangeId());

        // retrieve the balances for both exchanges in parallel
        async.parallel([
            function(callback){
                balanceTracker.retrieveBalance(ex1,callback);
            },
            function(callback){
                balanceTracker.retrieveBalance(ex2,callback);
            }
        ],function(err,results){
            if(err){
                console.log("ProcessLinkedOrder's RetrieveBalance(s) had error",err);
                throw err;
            }

            // after receiving the balances, validate the balances in parallel
            var balance1 = results[0];
            var balance2 = results[1];

            async.parallel([
                function(callback) {
                    callback(null,makeSureEnoughBalance(balance1,order1,ex1));
                },
                function(callback) {
                    callback(null,makeSureEnoughBalance(balance2,order2,ex2));
                }
            ],function(err,results){
                if(err) {
                    console.log("ProcessLinkedOrder's makeSureEnoughBalance(s) had error",err);
                    throw err;
                }
                // make sure all the exchanges have enough balance
                if(!results[0] || !results[1]) {
                    console.log('makeSureEnoughBalance returned insufficient balance');
                    return false;
                }
                // we have enough money to do the trade, do it in parallel
                async.parallel([
                    function(){ ex1.processOrder(order1); },
                    function(){ ex2.processOrder(order2); }
                ],
                // after submitting the trades successfully update the balances in redis
                function(err,results){
                    // TODO after processOrder can accept a callback
                    // change this to use the callback to adjust the balance accordingly
                    // TODO fire 2 ORDER_PROCESSED events so an OrderTracker process can go and monitor the status of these orders
                    if(err) {
                        console.log("ProcessLinkedOrder's exchange.processOrder(s) had error",err);
                        throw err;
                    }

                    // update the balances in parallel
                    async.parallel([
                        function(){ adjustBalance(order1,ex1)},
                        function(){ adjustBalance(order2,ex2)}
                    ]);
                });
            });

        });

    }
};

module.exports = exports = OrderProcessor;