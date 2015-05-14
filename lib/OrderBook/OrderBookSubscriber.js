/**
 * Created by parthpatel1001 on 5/14/15.
 */

var OrderBookSubscriber = function(RedisClient) {

    var Redis = RedisClient.createClient();

    this.subscribeToOrderBookTop = function(CHANNEL,callback) {
        Redis.subscribe(CHANNEL);
        Redis.on("message",function(channel,message){
            var book = JSON.parse(message);
            callback(book);
            //console.log(book);
        });
    };
};

module.exports = exports = OrderBookSubscriber;