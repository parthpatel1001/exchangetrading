import {OrderFactory} from '../../lib/Order/OrderFactory.js';
import assert from "assert";

describe('SellOrder',() => {
    it('Should serialize with a SELL type',() => {
        let order = {
            id: 55,
            exchange: '{"exchangeId": 1}',
            amount: 100,
            price: 300,
            type: 'SELL'
        };

        let testSellOrder = OrderFactory.createFromDeSerialized(order);
        let str = testSellOrder.serialize();
        let raw = JSON.parse(str);
        let newSellOrder = OrderFactory.createFromDeSerialized(JSON.parse(str));

        assert(testSellOrder.compare(newSellOrder),'compare function was not true');

        assert(raw.type === 'SELL','type was not buy');

    });
});
