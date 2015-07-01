import config from 'config';
import {RedisWrapper} from '../Wrappers/redisWrapper';

let KEY = config.get('CacheKeys.ORDER_BOOK_TOP'),
    CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK');

export class OrderBookPusher {
    constructor(orderBookManager) {
        orderBookManager.subscribeToOrderBooks((orderBookTop) => {
            RedisWrapper.getValue(KEY,(err,reply) => {
                if(err) {
                    console.log('Redis Get err: '+err);
                    return;
                }

                // only push a message if the book has changed
                console.log('orderBooks changed', reply, orderBookTop);
                if(reply != orderBookTop) {
                    RedisWrapper.setValue(KEY,orderBookTop);
                    RedisWrapper.publishValue(CHANNEL,orderBookTop);
                }
            });

        });
    }
}
