/**
 * Created by parthpatel1001 on 5/17/15.
 */
var OrderSubscriber = function(RedisClient,Order){
    var Redis = RedisClient.createClient();
    
    this.subscribeToOrderStream = function(CHANNEL,callback){
        Redis.subscribe(CHANNEL);
        Redis.on("message",function(channel,message){
            callback(new Order(JSON.parse(message)));
        });

    };

    this.subscribeToLinkedOrderStream = function(CHANNEL,callback) {
        Redis.subscribe(CHANNEL);
        Redis.on("message",function(channel,message){
            message = JSON.parse(message);
            callback(new Order(JSON.parse(message[0])),new Order(JSON.parse(message[1])));
        });
    };
};

module.exports = exports = OrderSubscriber;