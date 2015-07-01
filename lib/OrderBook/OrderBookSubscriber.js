import config from 'config';
import {RedisWrapper} from '../Wrappers/redisWrapper';

let CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK');

export class OrderBookSubscriber {
    constructor(callbackObj, funcName) {
        RedisWrapper.subscribe(CHANNEL, (channel,book) => {
            callbackObj[funcName](book);
        });
    }
}
