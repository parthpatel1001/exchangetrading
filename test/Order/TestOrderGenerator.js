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
    var orderSub,orderPub,orderGen,buyPrice,sellPrice,amount,exchangeIds,safetyAmount;
    beforeEach(function() {
        clientMock = redisMock.createClient();
        RedisWrapper.setClient(clientMock);
        orderSub = new OrderSubscriber(clientMock);
        orderPub = new OrderPublisher(clientMock);
        orderGen = new OrderGenerator(orderPub);

        //dummy data to be used for tests
        buyPrice = num(9);
        sellPrice = num(7);
        amount = num(13);
        exchangeIds = [0,1];
        safetyAmount = orderGen.getSafetyAmount(buyPrice); //0.777.. so we don't spend more than the $7 threshold on a trade
    });

    afterEach(function() {
        clientMock.end();
    });

    it("Asserts that we do not buy more than the safety value", function(){
        var callback = function(order1, order2) {
            expect(order1.Amount.cmp(amount)).to.equal(-1); //less than amount specified
            expect(order1.Amount.cmp(safetyAmount)).to.equal(0); //same as safetyAmount
        };

        var CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM');

        orderSub.subscribeToLinkedOrderStream(CHANNEL, callback);
        orderGen.generateOrder(exchangeIds, buyPrice, sellPrice, amount);
    });
});
