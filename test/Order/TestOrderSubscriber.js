var simple = require('simple-mock');
var redisMock = require('redis-mock');
var OrderSubscriber = require('../../lib/Order/OrderSubscriber.js');
var OrderPublisher = require('../../lib/Order/OrderPublisher.js');
var Order = require('../../lib/Order/Order.js');
var expect = require('expect.js');

var config = require('config');

var clientMock = redisMock.createClient();
OrderSubscriber = new OrderSubscriber(clientMock);
OrderPublisher = new OrderPublisher(clientMock);

describe('OrderSubscriber', function(){
	it("Expects subscriber's callback to be called on a publish, order is an isntance of an Order and is a buy order", function(done){
		var callback = simple.spy(function(order) {
			//should run after publish
			expect(callback.called).to.be(true);
			expect(order).to.be.an(Order);
			expect(order.isBuyOrder()).to.be(true);
			done();
		});

		var CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM')
		var someOrder = new Order({'orderType': 'BUY'});

		OrderSubscriber.subscribeToOrderStream(CHANNEL, callback);

		//function is not called before publish
		expect(callback.called).to.be(false);

		OrderPublisher.publishNewOrder(someOrder);
	});
});
