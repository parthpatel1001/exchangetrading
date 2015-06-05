var Redis = require("redis"),
    config = require('config');

var OrderBookSubscriber = function() {
    var CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK'),
        redisClient = Redis.createClient(); // TODO: Can this be moved outside of the class?

    this.subscribeToOrderBookTop = function(callback) {
        redisClient.subscribe(CHANNEL);
        redisClient.on("message",function(channel,message){
            var book = JSON.parse(message);
            callback(book);
            //console.log(book);
        });
    };
};

module.exports = exports = OrderBookSubscriber;