/**
 * Created by parthpatel1001 on 6/1/15.
 */
var simple = require('simple-mock');
var OrderProcessor = require('../../lib/Order/OrderProcessor.js');
var ExchangeManager = require('../../lib/Exchange/ExchangeManager.js');
var BalanceTracker = require('../../lib/Balance/BalanceTracker.js');
var Notifier = require('../../lib/Notification.js');
var Order = require('../../lib/Order/Order.js');
var Balance = require('../../lib/Balance/Balance.js');
var Exchange = require('../../lib/Exchange/Bitstamp/BitstampExchange.js');

var assert = require("assert");

var balanceIn = {},
	orderIn = {},
	exchangeId = 0;

OrderProcessor = new OrderProcessor(OrderProcessor,ExchangeManager,Notifier);

describe('OrderProcessor', function(){
	it('Should throw error on invalid order',function(done){
		simple.mock(orderIn, 'orderType', 'INVALID');
		
		order = new Order(orderIn);
		balance = new Balance(balanceIn);
		exchange = new Exchange(exchangeId);

		assert.throws(function() {
			OrderProcessor.makeSureEnoughBalance(balance, order, exchange)
		});
		done();
	});

	it('Expects true if enough money in balance to cover amount * price',function(done){
		simple.mock(orderIn, 'orderType', 'BUY');
		simple.mock(orderIn, 'amount', 3);
		simple.mock(orderIn, 'price', 12);
		simple.mock(balanceIn, 'usd_avail', 300);

		order = new Order(orderIn);
		balance = new Balance(balanceIn);
		exchange = new Exchange(exchangeId);

		assert(OrderProcessor.makeSureEnoughBalance(balance, order, exchange) === true);
		done();
	});

	it('Expects false if not enough money in balance to cover amount * price',function(done){
		simple.mock(orderIn, 'orderType', 'BUY');
		simple.mock(orderIn, 'amount', 3);
		simple.mock(orderIn, 'price', 1.2);
		simple.mock(balanceIn, 'usd_avail', 1);

		order = new Order(orderIn);
		balance = new Balance(balanceIn);
		exchange = new Exchange(exchangeId);

		assert(OrderProcessor.makeSureEnoughBalance(balance, order, exchange) === false);
		done();
	});
});
