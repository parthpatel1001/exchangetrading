import config from 'config';
import Redis from 'redis';

let CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK'),
    redisClient = Redis.createClient(); // TODO: Can this be moved outside of the class?

export class OrderBookSubscriber {
    constructor(callbackObj, funcName) {
        redisClient.subscribe(CHANNEL);
        redisClient.on("message",function(channel,book){
            console.log('OrderBookSubscriber message sub', callbackObj, funcName, book);
            callbackObj[funcName](book);
        });
    }
}
