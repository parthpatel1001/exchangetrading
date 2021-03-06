import assert from "assert";
import {OrderFactory} from '../../lib/Order/OrderFactory.js';
import {BuyOrder} from '../../lib/Order/BuyOrder.js';
import {SellOrder} from '../../lib/Order/SellOrder.js';

describe('OrderFactory.createFromDeserialized',function(){
    it('Should create a buy order if provided a BUY order type',function(){
       let order = {
           id: 55,
           exchange: '{"exchangeId": 0}',
           amount: 100,
           price: 300,
           type: 'BUY'
       };

        assert(OrderFactory.createFromDeSerialized(order) instanceof BuyOrder);
    });

    it('Should create a sell order if provided a SELL order type',function(){
        let order = {
            id: 55,
            exchange: '{"exchangeId": 0}',
            amount: 100,
            price: 300,
            type: 'SELL'
        };

        assert(OrderFactory.createFromDeSerialized(order) instanceof SellOrder);
    });

    it('Should throw an error if provided the wrong type',function(){
        let order = {
            id: 55,
            exchange: 2,
            amount: 100,
            price: 300,
            type: 'Bad'
        };

        assert.throws(function(){
            OrderFactory.createFromDeSerialized(order)
        },TypeError);
    });

    it('Should throw an error if provided a bad POJS order object',function(){
        assert.throws(function(){
            let order = {
                id: 55
            };
            OrderFactory.createFromDeSerialized(order)
        },TypeError);

        assert.throws(function(){
            let order = {
                exchange: 2,
                amount: 100,
                price: 300,
                type: 'Bad'
            };
            OrderFactory.createFromDeSerialized(order)
        },TypeError);

        assert.throws(function(){
            let order = {
                price: 300
            };
            OrderFactory.createFromDeSerialized(order)
        },TypeError);

        assert.throws(function(){
            let order = {};
            OrderFactory.createFromDeSerialized(order)
        },TypeError);
    });

    it('Should create a sell order if provided a SELL order type',function(){
        let order = {
            id: 55,
            exchange: '{"exchangeId": 0}',
            amount: 100,
            price: 300,
            type: 'SELL'
        };

        assert(OrderFactory.createFromDeSerialized(order) instanceof SellOrder);
    });

});

describe('OrderFactory.create____Order',function(){
    it('Should create a buy order, given at least an exchange with it',function(){
        assert(OrderFactory.createBuyOrder({
                exchange: '{"exchangeId": 0}'
            }) instanceof BuyOrder);
        assert(OrderFactory.createBuyOrder({
                exchange: '{"exchangeId": 0}',
                type: 'SELL'
           }) instanceof BuyOrder);
    });

    it('Should create a sell order, given at least an exchange with it',function(){
        assert(OrderFactory.createSellOrder({
                exchange: '{"exchangeId": 0}'
            }) instanceof SellOrder);
        assert(OrderFactory.createSellOrder({
                exchange: '{"exchangeId": 0}',
                type: 'BUY'
            }) instanceof SellOrder);
    });
});