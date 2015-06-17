/**
 * Created by parthpatel1001 on 6/1/15.
 */
var simple = require('simple-mock');
var OrderProcessor = require('../../lib/Order/OrderProcessor.js');
var ExchangeManager = require('../../lib/Exchange/ExchangeManager.js');
var Order = require('../../lib/Order/Order.js');
var Balance = require('../../lib/Balance/Balance.js');
var Exchange = require('../../lib/Exchange/Bitstamp/BitstampExchange.js');

var assert = require("assert");

var balanceIn = {},
	orderIn = {};

OrderProcessor = new OrderProcessor(ExchangeManager);

describe('OrderProcessor', function(){
	/*
	** Start makeSureEnoughBalance tests
	*/
	it('Should throw error on invalid order',function(done){
		simple.mock(orderIn, 'orderType', 'INVALID');
		
		var order = new Order(orderIn);
		var balance = new Balance(balanceIn);
		var exchange = new Exchange();

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

		var order = new Order(orderIn);
		var balance = new Balance(balanceIn);
		var exchange = new Exchange();

		assert(OrderProcessor.makeSureEnoughBalance(balance, order, exchange) === true);
		done();
	});

	it('Expects false if not enough money in balance to cover amount * price',function(done){
		simple.mock(orderIn, 'orderType', 'BUY');
		simple.mock(orderIn, 'amount', 3);
		simple.mock(orderIn, 'price', 1.2);
		simple.mock(balanceIn, 'usd_avail', 1);

		var order = new Order(orderIn);
		var balance = new Balance(balanceIn);
		var exchange = new Exchange();

		assert(OrderProcessor.makeSureEnoughBalance(balance, order, exchange) === false);
		done();
	});

	it('Expects to process sell order if enough BTC',function(done){
		simple.mock(orderIn, 'orderType', 'SELL');
		simple.mock(orderIn, 'amount', 2);
		simple.mock(balanceIn, 'btc_avail', 3);

		var order = new Order(orderIn);
		var balance = new Balance(balanceIn);
		var exchange = new Exchange();

		assert(OrderProcessor.makeSureEnoughBalance(balance, order, exchange) === true);
		done();
	});

	it('Expects to not process sell order if not enough BTC',function(done){
		simple.mock(orderIn, 'orderType', 'SELL');
		simple.mock(orderIn, 'amount', 2);
		simple.mock(balanceIn, 'btc_avail', 1);

		var order = new Order(orderIn);
		var balance = new Balance(balanceIn);
		var exchange = new Exchange();

		assert(OrderProcessor.makeSureEnoughBalance(balance, order, exchange) === false);
		done();
	});
	/*
	** End makeSureEnoughBalance tests
	*/
});
