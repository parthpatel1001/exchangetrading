/**
 * Created by parthpatel1001 on 5/17/15.
 */

var OrderPublisher = function(RedisClient,CHANNEL){
    var Redis = RedisClient.createClient();

    this.publishNewOrder = function(Order){
        Redis.publish(CHANNEL,Order.serialize());
    };
    this.publishLinkedOrders = function(Order1,Order2) {
      Redis.publish(CHANNEL,JSON.stringify([Order1.serialize(),Order2.serialize()]));
    };
};

module.exports = exports = OrderPublisher;