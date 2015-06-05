var Redis = require("redis"),
    config = require('config'),
    OrderBookTracker = require('../lib/OrderBook/OrderBookTracker.js');

var OrderBookSubscriber = function() {
    var channel = config.get('EventChannels.ORDER_BOOK_TICK'),
        redisClient = Redis.createClient(), // TODO: Can this be moved outside of the class?
        orderBookTracker = new OrderBookTracker();

    redisClient.subscribe(channel);
    redisClient.on("message",function(channel,message){
        var book = JSON.parse(message);
        orderBookTracker.trackOrderBook(book);
        //console.log(book);
    });
};

module.exports = exports = OrderBookSubscriber;