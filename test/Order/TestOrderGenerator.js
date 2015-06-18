var simple = require('simple-mock');
var redisMock = require('redis-mock');
var num = require('num');
var OrderPublisher = require('../../lib/Order/OrderPublisher.js');
var OrderSubscriber = require('../../lib/Order/OrderSubscriber.js');
var OrderGenerator = require('../../lib/Order/OrderGenerator.js');
var Exchange = require('../../lib/Exchange/Bitstamp/BitstampExchange.js');
var expect = require('expect.js');

var config = require('config');

describe('OrderGenerator', function(){
	before(function() {
		clientMock = redisMock.createClient();
		OrderSubscriber = new OrderSubscriber(clientMock);
		OrderPublisher = new OrderPublisher(clientMock);
		OrderGenerator = new OrderGenerator();
	});

	after(function() {
		clientMock.end();
	});

	it("Asserts that we do not buy more than the safety value", function(){
		var callback = function(order1, order2) {
			expect(order1.getAmount().cmp(amount)).to.equal(-1); //less than amount specified
			expect(order1.getAmount().cmp(safetyAmount)).to.equal(0); //same as safetyAmount
		};

		var buyPrice = num(9);
		var	sellPrice = num(7);
		var	amount = num(13);
		var safetyAmount = OrderGenerator.getSafetyAmount(buyPrice); //0.77.. so we don't spend more than the $7 threshold on a trade

		var exchange = new Exchange();
		
		var CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM');

		OrderGenerator.registerOrderPublisher(OrderPublisher);

		OrderSubscriber.subscribeToLinkedOrderStream(CHANNEL, callback);

		OrderGenerator.generateOrder(exchange, buyPrice, sellPrice, amount);
	});
});