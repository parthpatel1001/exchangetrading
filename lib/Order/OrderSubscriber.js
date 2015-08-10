import {RedisWrapper} from '../Wrappers/redisWrapper';
import {OrderFactory} from './OrderFactory';

export class OrderSubscriber {
    subscribeToOrderStream(CHANNEL,callback){
        RedisWrapper.subscribe(CHANNEL, (message) => {
            let order = new Order(message);
            callback(order);
        });
    }

    subscribeToLinkedOrderStream(CHANNEL,callback) {
        RedisWrapper.subscribe(CHANNEL, (message) => {
            let order1 = OrderFactory.createFromDeSerialized(JSON.parse(message[0])),
                order2 = OrderFactory.createFromDeSerialized(JSON.parse(message[1]));
            callback(order1, order2);
        });
    };
}

