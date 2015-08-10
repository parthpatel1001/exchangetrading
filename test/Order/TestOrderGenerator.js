var redisMock = require('redis-mock');
var num = require('num');
import {OrderSubscriber} from '../../lib/Order/OrderSubscriber.js';
import {OrderPublisher}  from '../../lib/Order/OrderPublisher.js';
import {OrderGenerator} from '../../lib/Order/OrderGenerator.js';
import {OrderBase} from '../../lib/Order/OrderBase.js';
import {RedisWrapper} from '../../lib/Wrappers/redisWrapper.js';
var expect = require('expect.js');

import config from 'config';

describe('OrderGenerator', function(){
    // set these up in global scope
    let clientMock = null;
    var orderSub,orderPub,orderGen,buyPrice,sellPrice,amount,exchanges, publisherCalled;
    beforeEach(function() {
        clientMock = redisMock.createClient();
        RedisWrapper.setClients(clientMock, clientMock);
        orderSub = new OrderSubscriber();
        publisherCalled = false;
        orderPub = {
            publishLinkedOrders: () => {
                publisherCalled = true;
            }
        };
        orderGen = new OrderGenerator(orderPub);

        //dummy data to be used for tests
        buyPrice = num(9);
        sellPrice = num(7);
        amount = num(13);
        exchanges = [{exchangeId: 0},{exchangeId: 1}];
    });

    afterEach(function() {
        clientMock.end();
    });

    it("Asserts that we do not buy more than the safety value", function(){
        var callback = function(order1, order2) {
            expect(order1.Amount.cmp(amount)).to.equal(-1); //less than amount specified
            expect(order1.Amount.sub(1) < order1.Amount).to.equal(true); //within the margin of the safety amount
            expect(order1.Amount.add(1) > order1.Amount).to.equal(true); //within the margin of the safety amount
            expect(publisherCalled).to.be(true);
        };

        var CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM');

        orderSub.subscribeToLinkedOrderStream(CHANNEL, callback);
        orderGen.generateOrder(exchanges, buyPrice, sellPrice, amount);
    });
});
