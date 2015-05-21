/**
 * Created by parthpatel1001 on 5/17/15.
 */

var OrderProcessor = function(MAX_TRADE_AMOUNT){

    this.processOrder = function(order){
        console.log(order.serialize());
    };

    this.processLinkedOrder = function(order1,order2) {
        console.log(order1.serialize()+" "+order2.serialize());
    }
};

module.exports = exports = OrderProcessor;