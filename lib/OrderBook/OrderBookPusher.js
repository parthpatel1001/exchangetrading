import config from 'config';
import {objectEntries} from '../Utilities'
import {OrderBook} from './OrderBook'
import {RedisWrapper} from '../Wrappers/redisWrapper';

let KEY = config.get('CacheKeys.ORDER_BOOK_TOP'),
    CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK');

export class OrderBookPusher {
    constructor(orderBookManager) {
        orderBookManager.subscribeToOrderBooks((orderBookTop) => {
            RedisWrapper.getValue(KEY,(reply) => {
                // only push a message if the book has changed
                console.log('orderBooks changed', reply, orderBookTop);
                if(reply != orderBookTop) {
                    let toStore = {};
                    for (let [exchId, book] of objectEntries(orderBookTop)) {
                        toStore[exchId] = book.toString();
                    }

                    console.log('orderBooks changed from redis version so saving and publishing', toStore);
                    RedisWrapper.setValue(KEY,toStore);
                    RedisWrapper.publishValue(CHANNEL,toStore);
                }
            });

        });
    }
}
