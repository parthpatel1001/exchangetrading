import config from 'config';
import Redis from "redis";

let redisClient = Redis.createClient(),
    KEY = config.get('CacheKeys.ORDER_BOOK_TOP'),
    CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK');

export class OrderBookPusher {
    constructor(orderBookManager) {
        orderBookManager.subscribeToOrderBooks((orderBookTop) => {
            redisClient.get(KEY,(err,reply) => {
                if(err) {
                    console.log('Redis Get err: '+err);
                    return;
                }

                // only push a message if the book has changed
                if(reply != orderBookTop) {
                    redisClient.set(KEY,orderBookTop);
                    redisClient.publish(CHANNEL,orderBookTop);
                }
            });

        });
    }
}
