import simple from 'simple-mock';
import {OrderProcessor} from '../../lib/Order/OrderProcessor.js';
import {OrderFactory} from '../../lib/Order/OrderFactory.js';
import {SellOrder} from '../../lib/Order/SellOrder.js';
import {BuyOrder} from '../../lib/Order/BuyOrder.js';
import {Balance} from '../../lib/Balance/Balance.js';
import {BitstampExchange} from '../../lib/Exchange/Wrappers/BitstampExchange.js';
import assert from "assert";
import expect from "expect.js";
import async from 'async';

var balanceIn = {},
	orderIn = {};

var orderProcessor;

describe('OrderProcessor', () => {
   
    afterEach(function() {
        simple.restore();
    });

	/*
	** Start makeSureEnoughBalance tests
	*/
    it('.processLinkedOrder() Should throw error on invalid order',(done) => {
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


        orderProcessor.processLinkedOrder(order, order).then(() => {
            assert(false);
            done();
        }).catch((err) => {
            assert(err == 'Error: Bad order type: undefined');
            done();
        });
    });

    it('Exchange.ProcessOrder should be called with a BuyOrder if enough money in balance to cover amount * price', (done) => {
		var order = OrderFactory.createBuyOrder({
            exchange: '{"exchangeId": 1}',
            amount: 3,
            price: 15
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
                var balance = Balance.createFromPlainObject({usd_avail:303,btc_avail:6,exchange_id:1});
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

        var processOrderSpy = simple.mock(BitstampExchange, 'processOrder');

        let balTracker = {
            retrieveBalance: (ex, cb) => {
                var balance = Balance.createFromPlainObject({usd_avail:1,btc_avail:5,exchange_id:1});

                cb(null, balance);
            }
        };
        orderProcessor = new OrderProcessor(balTracker);
        orderProcessor.processLinkedOrder(order, order).then(() => {
            assert(false); // If the promise was resolved rather than rejected for some reason, fail the test
            done();
        }).catch((err) => {
            expect(processOrderSpy.called).to.be(false);
            assert(err === 'makeSureEnoughBalance returned insufficient balance');
            done();
        });
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

    it('Exchange.ProcessOrder should never be called if not enough BTC in balance to cover amount * price', () => {
        var order = OrderFactory.createSellOrder({
            exchange: '{"exchangeId": 1}',
            amount: 3,
            price: 12
        });

        var processOrderSpy = simple.mock(BitstampExchange, 'processOrder');

        let balTracker = {
            retrieveBalance: (ex, cb) => {
                var balance = Balance.createFromPlainObject({usd_avail:1,btc_avail:1,exchange_id:1});

                cb(null, balance);
            }
        };
        orderProcessor = new OrderProcessor(balTracker);
        orderProcessor.processLinkedOrder(order, order).then(() => {
            assert(false); // If the promise was resolved rather than rejected for some reason, fail the test
            done();
        }).catch((err) => {
            expect(processOrderSpy.called).to.be(false);
            assert(err === 'makeSureEnoughBalance returned insufficient balance');
            done();
        });
    });

	/*
	** End makeSureEnoughBalance tests
	*/
});
