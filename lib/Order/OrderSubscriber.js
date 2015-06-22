var Order = require('./Order.js');

var OrderSubscriber = function(RedisClient){
    var CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM');
    
    this.subscribeToOrderStream = function(callback){
        RedisClient.subscribe(CHANNEL);
        RedisClient.on("message",function(channel,message){
            callback(new Order(JSON.parse(message)));
        });
    };

    this.subscribeToLinkedOrderStream = function(callback) {
        RedisClient.subscribe(CHANNEL);
        RedisClient.on("message",function(channel,message){
            message = JSON.parse(message);
            callback(new Order(JSON.parse(message[0])),new Order(JSON.parse(message[1])));
        });
    };
};

module.exports = exports = OrderSubscriber;