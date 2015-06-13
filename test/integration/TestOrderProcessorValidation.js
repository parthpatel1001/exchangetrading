/**
 * Created by parthpatel1001 on 6/1/15.
 */
var simple = require('simple-mock');
var OrderProcessor = require('../../lib/Order/OrderProcessor.js');
var ExchangeManager = require('../../lib/Exchange/ExchangeManager.js');
var BalanceTracker = require('../../lib/Balance/BalanceTracker.js');
var Notifier = require('../../lib/Notification.js');
var Order = require('../../lib/Order/Order.js');
var assert = require("assert");


var balance = {},
	orderIn = {},
	exchange = {};

simple.mock(orderIn, 'orderType', 'INVALID');
order = new Order(orderIn);

OrderProcessor = new OrderProcessor(OrderProcessor,ExchangeManager,Notifier);

describe('OrderProcessor', function(){
	it('Should throw error on invalid order',function(done){
		assert.throws(function() {
			OrderProcessor.makeSureEnoughBalance(balance, order, exchange)
		});
		done();
	});
});
