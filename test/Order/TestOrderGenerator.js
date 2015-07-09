var simple = require('simple-mock');
var redisMock = require('redis-mock');
var num = require('num');
var OrderPublisher = require('../../lib/Order/OrderPublisher.js');
var OrderSubscriber = require('../../lib/Order/OrderSubscriber.js');
var OrderGenerator = require('../../lib/Order/OrderGenerator.js');
var Order = require('../../lib/Order/Order.js');
var expect = require('expect.js');

var config = require('config');

describe('OrderGenerator', function(){
	before(function() {
		clientMock = redisMock.createClient();
		OrderSubscriber = new OrderSubscriber(clientMock);
		OrderPublisher = new OrderPublisher(clientMock);
		OrderGenerator = new OrderGenerator();

		//dummy data to be used for tests
		buyPrice = num(9);
		sellPrice = num(7);
		amount = num(13);
		exchangeIds = [0,1];
		safetyAmount = OrderGenerator.getSafetyAmount(buyPrice); //0.777.. so we don't spend more than the $7 threshold on a trade
	});

	after(function() {
		clientMock.end();
	});

	afterEach(function() {
		simple.restore();
	});

	it("Tests createBuyOrder()", function() {
		var order = OrderGenerator.createBuyOrder(exchangeIds[0], buyPrice, amount);
		expect(order).to.be.an(Order);
		expect(order.isBuyOrder()).to.be(true);
		expect(order.getExchangeId()).to.equal(exchangeIds[0]);
		expect(order.getPrice().cmp(buyPrice)).to.equal(0);
		expect(order.getAmount().cmp(amount)).to.equal(0);
	});

	it("Tests createSellOrder()", function() {
		var order = OrderGenerator.createSellOrder(exchangeIds[0], buyPrice, amount);
		expect(order).to.be.an(Order);
		expect(order.isSellOrder()).to.be(true);
		expect(order.getExchangeId()).to.equal(exchangeIds[0]);
		expect(order.getPrice().cmp(buyPrice)).to.equal(0);
		expect(order.getAmount().cmp(amount)).to.equal(0);
	});

	it("Asserts that we do not buy more than the safety value", function(){
		var callback = function(order1, order2) {
			expect(order1.getAmount().cmp(amount)).to.equal(-1); //less than amount specified
			expect(order1.getAmount().cmp(safetyAmount)).to.equal(0); //same as safetyAmount
		};
		
		var CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM');

		OrderGenerator.registerOrderPublisher(OrderPublisher);
		OrderSubscriber.subscribeToLinkedOrderStream(CHANNEL, callback);
		OrderGenerator.generateOrder(exchangeIds, buyPrice, sellPrice, amount);
	});

	it("Asserts buy and sell orders were created on subscribeToLinkedOrderStream()", function(){
		var createBuySpy = simple.mock(OrderGenerator, "createBuyOrder");
		var createSellSpy = simple.mock(OrderGenerator, "createSellOrder");

		var CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM');

		OrderGenerator.registerOrderPublisher(OrderPublisher);
		OrderGenerator.generateOrder(exchangeIds, buyPrice, sellPrice, amount);

		expect(createBuySpy.called).to.be(true);
		expect(createSellSpy.called).to.be(true);
	});
});