var Redis = require("redis"),
    config = require('config');

var OrderPublisher = function(){
    var CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM'),
        redisClient = Redis.createClient(); // TODO: Can this be moved outside of the class?

    this.publishNewOrder = function(Order){
        redisClient.publish(CHANNEL,Order.serialize());
    };
    this.publishLinkedOrders = function(Order1,Order2) {
        redisClient.publish(CHANNEL,JSON.stringify([Order1.serialize(),Order2.serialize()]));
    };
};

module.exports = exports = OrderPublisher;