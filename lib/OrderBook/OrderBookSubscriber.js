import config from 'config';
import Redis from 'redis';

let CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK'),
    redisClient = Redis.createClient(); // TODO: Can this be moved outside of the class?

export class OrderBookSubscriber {
    subscribeToOrderBookTop (callbackObj, funcName) {
        redisClient.subscribe(CHANNEL);
        redisClient.on("message",function(channel,message){
            var book = JSON.parse(message);
            callbackObj[funcName](book);
            //console.log(book);
        });
    };
}
