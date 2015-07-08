import {RedisWrapper} from '../Wrappers/redisWrapper';
import {Order} from './Order.js';

export class OrderSubscriber {
    subscribeToOrderStream(CHANNEL,callback){
        RedisWrapper.subscribe(CHANNEL, (message) => {
            callback(new Order(message));
        });
    }

    subscribeToLinkedOrderStream(CHANNEL,callback) {
        RedisWrapper.subscribe(CHANNEL, (message) => {
            callback(new Order(JSON.parse(message[0])),
                     new Order(JSON.parse(message[1])));
        });
    };
}
