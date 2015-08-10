import config from 'config';
import {RedisWrapper} from '../Wrappers/redisWrapper';

let CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM');

export class OrderPublisher {
    publishNewOrder(order){
        console.log('OrderPublisher publishNewOrder', order.serialize());
        RedisWrapper.publishValue(CHANNEL,order.serialize());
    }

    publishLinkedOrders(order1,order2) {
        console.log('OrderPublisher publishLinkedOrders', order1.serialize(), order2.serialize());
        RedisWrapper.publishValue(CHANNEL,[order1.serialize(),order2.serialize()]);
    };
}
