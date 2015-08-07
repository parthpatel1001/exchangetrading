import {OrderFactory} from '../../lib/Order/OrderFactory.js';
import assert from "assert";

describe('BuyOrder',() => {
    it('Should be created from serialize with a BUY type',() => {
        let order = {
            id: 55,
            exchange: '{"exchangeId": 0}',
            amount: 100,
            price: 300,
            type: 'BUY'
        };

        let testBuyOrder = OrderFactory.createFromDeSerialized(order);
        let str = testBuyOrder.serialize();
        let raw = JSON.parse(str);
        let newBuyOrder = OrderFactory.createFromDeSerialized(JSON.parse(str));

        assert(testBuyOrder.compare(newBuyOrder),'compare function was not true');

        console.log('raw', raw);

        assert(raw.type === 'BUY','type was not buy');

    });
});