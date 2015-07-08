import config from 'config';
import {RedisWrapper} from '../Wrappers/redisWrapper';

let CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM');

export class OrderPublisher {
    publishNewOrder(Order){
        RedisWrapper.publishValue(CHANNEL,Order.serialize());
    }

    publishLinkedOrders(Order1,Order2) {
        RedisWrapper.publishValue(CHANNEL,[Order1.serialize(),Order2.serialize()]);
    };
}
