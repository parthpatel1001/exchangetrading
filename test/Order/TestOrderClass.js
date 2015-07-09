var num = require('num');
var simple = require('simple-mock');
var Order = require('../../lib/Order/Order.js');
var Exchange = require('../../lib/Exchange/Bitstamp/BitstampExchange.js');

var assert = require("assert");

var orderIn = {};

describe('Order', function(){
	it('Should return true on valid buy order or sell order type',function(){
		simple.mock(orderIn, 'orderType', 'BUY');
		var order = new Order(orderIn);
		assert(order.isBuyOrder() === true);

		simple.mock(orderIn, 'orderType', 'SELL');
		var order = new Order(orderIn);
		assert(order.isSellOrder() === true);
	});

	it('Should return false on invalid buy order or sell order type',function(){
		simple.mock(orderIn, 'orderType', 'NOTBUY');
		var order = new Order(orderIn);
		assert(order.isBuyOrder() === false);

		simple.mock(orderIn, 'orderType', 'NOTSELL');
		var order = new Order(orderIn);
		assert(order.isSellOrder() === false);
	});

	it('Should catch lower case mistakes',function(){
		simple.mock(orderIn, 'orderType', 'sell');

		var order = new Order(orderIn);
		assert(order.isSellOrder() === false);
	});

	it('Should give correct subtotal of order before fee',function(){
		var price = 3;
		var amount = 5;
		var expectedTotal = price * amount;

		simple.mock(orderIn, 'price', price);
		simple.mock(orderIn, 'amount', amount);

		var order = new Order(orderIn);
		assert(order.getMagnitude().cmp(num(expectedTotal)) === 0);
	});

	it('Should give correct total after fee if buy order',function(){
		var price = 3;
		var amount = 5;

		simple.mock(orderIn, 'orderType', 'BUY');
		simple.mock(orderIn, 'amount', amount);
		simple.mock(orderIn, 'price', price);

		var exchange = new Exchange();
		var fee = exchange.getFee();

		var expectedTotal = price * amount * (1 + parseFloat(fee));

		var order = new Order(orderIn);
		assert(order.getCost(fee).cmp(num(expectedTotal)) === 0);
	});

	it('Should give correct total after fee if sell order',function(){
		var price = 3;
		var amount = 5;

		simple.mock(orderIn, 'orderType', 'SELL');
		simple.mock(orderIn, 'amount', amount);
		simple.mock(orderIn, 'price', price);

		var exchange = new Exchange();
		var fee = exchange.getFee();

		var expectedTotal = price * amount * (1 - parseFloat(fee));

		var order = new Order(orderIn);
		assert(order.getCost(fee).cmp(num(expectedTotal)) === 0);
	});
});