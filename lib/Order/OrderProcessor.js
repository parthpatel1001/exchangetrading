import async from 'async';
import config from 'config';
import num from 'num';
import {Notification} from '../Notification'; // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER
import {BalanceTracker} from '../Balance/BalanceTracker.js';
import {BuyOrder} from './BuyOrder';
import {SellOrder} from './SellOrder';

/**
 * threshold for buy orders
 * where USD balance must be greater then order * (1+threshold)
 */
let MIN_BUY_THRESHOLD = config.get('TradeThresholds.MINIMUM_BUY_BALANCE_THRESHOLD');
/**
 * theshold for sell orders
 * where BTC balance must be greater then order * (1+threshold)
 */
let MIN_SELL_THRESHOLD = config.get('TradeThresholds.MINIMUM_SELL_BALANCE_THRESHOLD');

/**
 * options for notifications for good things (trades happening etc)
 */
let NOTIFY_GOOD_OPTS = config.get('Notification.Slack.good_config');
/**
 * options for notifications for bad things (trades happening etc)
 * Can deff make these have better names
 */
let NOTIFY_BAD_OPTS = config.get('Notification.Slack.error_config');

/**
 * Check the given balance object with the thresholds from the config to make sure
 * we have enough balance to execute the provided order
 * @param balance
 * @param order
 * @param exchange
 * @returns {boolean}
 */
let makeSureEnoughBalance = function(balance,order,exchange){
    if(order instanceof BuyOrder) {
        // when buying we have to make sure we have enough for the order + fee
        var cost = order.getCost(exchange.Fee);
        return balance.USDAvailable.mul(1 - MIN_BUY_THRESHOLD).cmp(cost) === 1;
    }
    if(order instanceof SellOrder) {
        // when selling we only have to check if we have enough BTC
        return balance.BTCAvailable.mul(1 - MIN_SELL_THRESHOLD).cmp(order.Amount) === 1;
    }
    throw new Error('Bad order type: '+order.serialize());
};

/**
 * Class OrderProcessor
 * Process's orders, for now only process' linked orders (orders to send to exactly 2 exchanges at once)
 * @param ExchangeManager
 * @constructor
 */
export class OrderProcessor {
    constructor(ExchangeManager) {
        this.exchangeManager = ExchangeManager;
        this.balanceTracker = new BalanceTracker();
        this.notifier = new Notification();

        /**
         * Process the provided two orders in parallel for (uber X hyperScale X metaData)speed
         * Only executes the orders if there is enough available balance on both exchanges
         * @param order1
         * @param order2
         */
        this.processLinkedOrder = (order1,order2) => {
            console.log("ProcessLinkedOrder Orders In: ", order1.serialize(), order2.serialize());
            var ex1 = this.exchangeManager.getExchange(order1.Exchange.ExchangeId),
                ex2 = this.exchangeManager.getExchange(order2.Exchange.ExchangeId);

            // retrieve the balances for both exchanges in parallel
            async.parallel([
                (callback) => {
                    this.balanceTracker.retrieveBalance(ex1,callback);
                },
                (callback) => {
                    this.balanceTracker.retrieveBalance(ex2,callback);
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
                    (callback) => {
                        callback(null,makeSureEnoughBalance(balance1,order1,ex1));
                    },
                    (callback) => {
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
                            () => { ex1.processOrder(order1); },
                            () => { ex2.processOrder(order2); }
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
                                () => { this.adjustBalance(order1,ex1) },
                                () => { this.adjustBalance(order2,ex2) }
                            ]);
                        }
                    );
                });
            });
        };
    }

    /**
     * Adjust the balance based on the type of order
     * The fee is always taken out as USD, the balances are adjusted reflecting the fee
     * @param order
     * @param exchange
     */
    adjustBalance(order,exchange) {
        var cost = order.getCost(exchange.Fee);
        if(order instanceof BuyOrder) {
            this.balanceTracker.decrementUSDBalance(exchange,cost);
            this.balanceTracker.incrementBTCBalance(exchange,order.Amount);
        }
        if(order instanceof SellOrder) {
            this.balanceTracker.decrementBTCBalance(exchange,order.Amount);
            this.balanceTracker.incrementUSDBalance(exchange,cost);
        }
    };

    /**
     * Not implemented currently
     * This will be useful for single "reallocate" orders
     * @param order
     */
    processOrder(order){
        console.log('OrderProcessor Not Implemented ProcessOrder', order.serialize());
    };
}
