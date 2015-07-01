import {RedisWrapper} from '../Wrappers/redisWrapper';
import {Order} from './Order.js';

export class OrderSubscriber {
    subscribeToOrderStream(CHANNEL,callback){
        RedisWrapper.subscribe(CHANNEL, (channel, message) => {
            callback(new Order(JSON.parse(message)));
        });
    }

    subscribeToLinkedOrderStream(CHANNEL,callback) {
        RedisWrapper.subscribe(CHANNEL, (channel, message) => {
            message = JSON.parse(message);
            callback(new Order(JSON.parse(message[0])),
                     new Order(JSON.parse(message[1])));
        });
    };
}
