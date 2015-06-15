var Redis = require("redis"),
    Order = require('./Order.js');

var OrderSubscriber = function(){
    var RedisClient = Redis.createClient();
    
    this.subscribeToOrderStream = function(CHANNEL,callback){
        RedisClient.subscribe(CHANNEL);
        RedisClient.on("message",function(channel,message){
            callback(new Order(JSON.parse(message)));
        });

    };

    this.subscribeToLinkedOrderStream = function(CHANNEL,callback) {
        RedisClient.subscribe(CHANNEL);
        RedisClient.on("message",function(channel,message){
            message = JSON.parse(message);
            callback(new Order(JSON.parse(message[0])),new Order(JSON.parse(message[1])));
        });
    };
};

module.exports = exports = OrderSubscriber;