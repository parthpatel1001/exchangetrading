// import assert from "assert";
// import {OrderBase} from '../../lib/Order/OrderBase';
// import {BuyOrder} from '../../lib/Order/BuyOrder';
// import {SerializeObject} from '../../lib/Utilities/Serializer';
var assert = require("assert");
var OrderBase = require('../../lib/Order/OrderBase');
var BuyOrder = require('../../lib/Order/BuyOrder');
var SerializeObject = require('../../lib/Utilities/Serializer');

describe('Serializer', function(){
    it('Should return a string version of the passed in very simple object',function(done){
        console.log('starting serialize test');
        let price = 3,
            amount = 5,
            order = new BuyOrder(null, price, amount, null);

        SerializeObject(order, './lib/Order/BuyOrder.js').then((serialized) => {
            console.log('SerializeObject success', serialized);

            assert(serialized instanceof String);
            done();
        }).catch((err) => {
            console.log('SerializeObject err', err);
            assert(false);
            done();
        });
    });
});
