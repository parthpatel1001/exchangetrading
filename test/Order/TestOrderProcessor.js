import simple from 'simple-mock';
import {OrderProcessor} from '../../lib/Order/OrderProcessor.js';
import {OrderFactory} from '../../lib/Order/OrderFactory.js';
import {SellOrder} from '../../lib/Order/SellOrder.js';
import {BuyOrder} from '../../lib/Order/BuyOrder.js';
import {Balance} from '../../lib/Balance/Balance.js';
import {BitstampExchange} from '../../lib/Exchange/Bitstamp/BitstampExchange.js';
import assert from "assert";
import expect from "expect.js";

var balanceIn = {},
	orderIn = {};

var orderProcessor;

describe('OrderProcessor', () => {
	/*
	** Start makeSureEnoughBalance tests
	*/
    it('.processLinkedOrder() Should throw error on invalid order',function(){
		simple.mock(orderIn, 'orderType', 'INVALID');

		var balance = new Balance(balanceIn);
		var exchange = new BitstampExchange();
        var order = {
            bad:'order',
            Exchange: exchange,
            serialize: () => {}
        };

        let balTracker = {
            retrieveBalance: (ex, cb) => {
                var balance = Balance.createFromPlainObject({usd_avail:300,btc_avail:5,exchange_id:1});
                cb(null, balance);
            }
        };
        orderProcessor = new OrderProcessor(balTracker);
        var fn = simple.mock(orderProcessor, 'processLinkedOrder');
        expect(fn).withArgs(balance, order, exchange).to.throwError();
    });

    it('Exchange.ProcessOrder should be called with a BuyOrder if enough money in balance to cover amount * price', (done) => {
		var order = OrderFactory.createBuyOrder({
            exchange: '{"exchangeId": 1}',
            amount: 3,
            price: 12
        });
        let processedOrders = 0;
		var exchange = new BitstampExchange();
        exchange.processOrder = (order) => {
            assert(order instanceof BuyOrder);
            assert(processedOrders < 2);
            processedOrders++;
            if(processedOrders == 2) {
                done();
            }
        };
        order.exchange = exchange;

        let balTracker = {
            retrieveBalance: (ex, cb) => {
                var balance = Balance.createFromPlainObject({usd_avail:300,btc_avail:5,exchange_id:1});
                cb(null, balance);
            }
        };
        orderProcessor = new OrderProcessor(balTracker);
        orderProcessor.processLinkedOrder(order, order);
    });

    it('Exchange.ProcessOrder should never be called if not enough money in balance to cover amount * price', (done) => {
        var order = OrderFactory.createBuyOrder({
            exchange: '{"exchangeId": 1}',
            amount: 3,
            price: 12
        });
        var exchange = new BitstampExchange();
        exchange.processOrder = () => {
            assert(false);
            done();
        };
        order.exchange = exchange;

        let timeout = null;
        let balTracker = {
            retrieveBalance: (ex, cb) => {
                var balance = Balance.createFromPlainObject({usd_avail:1,btc_avail:5,exchange_id:1});

                // Need to setup a way to tell the test to stop waiting to see if processOrder is ever going to be called
                timeout == null ? timeout = setTimeout(() => {
                        done();
                    },
                1000) : null;

                cb(null, balance);
            }
        };
        orderProcessor = new OrderProcessor(balTracker);
        orderProcessor.processLinkedOrder(order, order);
    });

    it('Exchange.ProcessOrder should be called with a SellOrder if enough BTC', (done) =>{
        var order = OrderFactory.createSellOrder({
            exchange: '{"exchangeId": 1}',
            amount: 3,
            price: 12
        });
        let processedOrders = 0;
        var exchange = new BitstampExchange();
        exchange.processOrder = () => {
            assert(order instanceof SellOrder);
            assert(processedOrders < 2);
            processedOrders++;
            if (processedOrders == 2) {
                done();
            }
        };
        order.exchange = exchange;

        let balTracker = {
            retrieveBalance: (ex, cb) => {
                var balance = Balance.createFromPlainObject({usd_avail:1,btc_avail:5,exchange_id:1});
                cb(null, balance);
            }
        };
        orderProcessor = new OrderProcessor(balTracker);
        orderProcessor.processLinkedOrder(order, order);
    });

    it('Exchange.ProcessOrder should never be called if not enough BTC in balance to cover amount * price', (done) => {
        var order = OrderFactory.createSellOrder({
            exchange: '{"exchangeId": 1}',
            amount: 3,
            price: 12
        });
        var exchange = new BitstampExchange();
        exchange.processOrder = () => {
            assert(false);
            done();
        };
        order.exchange = exchange;

        let timeout = null;
        let balTracker = {
            retrieveBalance: (ex, cb) => {
                var balance = Balance.createFromPlainObject({usd_avail:1,btc_avail:1,exchange_id:1});

                // Need to setup a way to tell the test to stop waiting to see if processOrder is ever going to be called
                timeout == null ? timeout = setTimeout(() => {
                        done();
                    },
                    1000) : null;

                cb(null, balance);
            }
        };
        orderProcessor = new OrderProcessor(balTracker);
        orderProcessor.processLinkedOrder(order, order);
    });

	/*
	** End makeSureEnoughBalance tests
	*/
});
