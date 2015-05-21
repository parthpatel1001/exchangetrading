/**
 * Created by parthpatel1001 on 5/17/15.
 */
var async = require('async');
var OrderProcessor = function(ExchangeManager){

    this.processOrder = function(order){
        console.log(order.serialize());
    };

    this.processLinkedOrder = function(order1,order2) {
        console.log("Order In: "+order1.serialize()+" "+order2.serialize());
        var ex1 = ExchangeManager.getExchange(order1.getExchangeId()),
            ex2 = ExchangeManager.getExchange(order2.getExchangeId());
        async.parallel([
            function(){
                ex1.processOrder(order1);
            },
            function(){
                ex2.processOrder(order2);
            }
        ]);
        // TODO THIS HAS TO BE DONE IN PARALLEL


    }
};

module.exports = exports = OrderProcessor;