var simple = require('simple-mock');
var redisMock = require('redis-mock');
import {RedisWrapper} from '../../lib/Wrappers/redisWrapper.js';
import {OrderSubscriber} from '../../lib/Order/OrderSubscriber.js';
import {OrderPublisher}  from '../../lib/Order/OrderPublisher.js';
import {Order} from '../../lib/Order/OrderBase.js';
import {OrderFactory} from '../../lib/Order/OrderFactory.js';
import {BuyOrder} from '../../lib/Order/BuyOrder.js';
import {SellOrder} from '../../lib/Order/SellOrder.js';
var expect = require('expect.js');
import config from 'config';
import assert from "assert";

describe('OrderSubscriber.subscribeToLinedOrderStream', function(){
    // set these up in global scope
    let clientMock = null;
    var orderSub,orderPub;
    before(function() {
		clientMock = redisMock.createClient();
        RedisWrapper.setClient(clientMock);
		orderSub = new OrderSubscriber();
		orderPub= new OrderPublisher();
	});

	afterEach(function() {
		clientMock.end();
	});

    //afterEach(function() {
    //    simple.restore();
    //});

	it("Should recieve both orders of the right type and be equal", function(done){

        var someOrder = OrderFactory.createFromDeSerialized({
            id: 55,
            exchange: 2,
            amount: 100,
            price: 300,
            type: 'BUY'
        });

        var someOrder2 = OrderFactory.createFromDeSerialized({
            id: 55,
            exchange: 2,
            amount: 100,
            price: 300,
            type: 'SELL'
        });

		var callback = simple.spy(function(order,order2) {
			//should run after publish
			expect(callback.called).to.be(true);
            // make sure the types are correct
			expect(order instanceof BuyOrder).to.be(true);
            expect(order2 instanceof SellOrder).to.be(true);
            /**
                make sure they did not mutate getting passed around
                this gets tricky, this assumes our callback behaves like:
                send(BUYORDER,SELLORDER)
                serialize-> "[BUYORDER,SELLORDER]"
                deserailize -> o1 = BUYORDER, o2 = SELLORDER
                callback(o1,o2)
                i.e. this test is making sure *deserialize* happens in the
                exact same order when it was an array
             */
            assert(someOrder.compare(order));
            assert(someOrder2.compare(order2));
			done();
		});



		orderSub.subscribeToLinkedOrderStream(config.get('EventChannels.LINKED_ORDER_STREAM'),callback);

		//function is not called before publish
		expect(callback.called).to.be(false);

		orderPub.publishLinkedOrders(someOrder,someOrder2);
	});
});
