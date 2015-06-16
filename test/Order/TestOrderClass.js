var num = require('num');
var simple = require('simple-mock');
var Order = require('../../lib/Order/Order.js');

var assert = require("assert");

var orderIn = {};

describe('Order', function(){
	it('Should return true on valid buy order or sell order type',function(done){
		simple.mock(orderIn, 'orderType', 'BUY');
		var order = new Order(orderIn);
		assert(order.isBuyOrder() === true);

		simple.mock(orderIn, 'orderType', 'SELL');
		var order = new Order(orderIn);
		assert(order.isSellOrder() === true);

		done();
	});

	it('Should return false on invalid buy order or sell order type',function(done){
		simple.mock(orderIn, 'orderType', 'NOTBUY');
		var order = new Order(orderIn);
		assert(order.isBuyOrder() === false);

		simple.mock(orderIn, 'orderType', 'NOTSELL');
		var order = new Order(orderIn);
		assert(order.isSellOrder() === false);

		done();
	});

	it('Should catch lower case mistakes',function(done){
		simple.mock(orderIn, 'orderType', 'sell');

		var order = new Order(orderIn);
		assert(order.isSellOrder() === false);

		done();
	});
});