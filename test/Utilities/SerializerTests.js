import assert from "assert";
import {OrderBase} from '../../lib/Order/OrderBase';
import {BuyOrder} from '../../lib/Order/BuyOrder';
import {SerializeObject} from '../../lib/Utilities/Serializer';

describe('Serializer', function(){
    it('Should return a string version of the passed in very simple object',function(){
        console.log('starting serialize test');
        let price = 3,
            amount = 5,
            order = new BuyOrder(null, price, amount, null);

        let serialized = SerializeObject(order, '../../lib/Order/BuyOrder');

        console.log('serialized', serialized);

        assert(serialized instanceof String);

    });
});
