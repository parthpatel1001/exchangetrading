/**
 * Created by parthpatel1001 on 7/29/15.
 */
import {OrderFactory} from '../../lib/Order/OrderFactory.js';
import assert from "assert";

describe('BuyOrder',function(){
    it('Should serialize with a BUY type',function(){
        let order = {
            id: 55,
            exchange: 2,
            amount: 100,
            price: 300,
            type: 'BUY'
        };

        let testBuyOrder = OrderFactory.createFromDeSerialized(order);
        let str = testBuyOrder.serialize();
        let raw = JSON.parse(str);
        let newBuyOrder = OrderFactory.createFromDeSerialized(JSON.parse(str));

        assert(testBuyOrder.compare(newBuyOrder),'compare function was not true');

        assert(raw.type === 'BUY','type was not buy');

    });
});