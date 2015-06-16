var
    config = require('config'),
    Redis = require("redis");

var OrderBookPusher = function (OrderBookManager) {
    var redisClient = Redis.createClient(),
        KEY = config.get('CacheKeys.ORDER_BOOK_TOP'),
        CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK');
    OrderBookManager.subscribeToOrderBooks(function(orderBookTop){
        var book = JSON.stringify(orderBookTop);

        redisClient.get(KEY,function(err,reply){
            if(err) {
                console.log('Redis Get err: '+err);
                return;
            }
            // only push a message if the book has changed
            if(reply != book) {
                redisClient.set(KEY,book);
                redisClient.publish(CHANNEL,book);
            }
        });

    });
};

module.exports = exports = OrderBookPusher;