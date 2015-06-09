import config from 'config';
import Redis from 'redis';

let CHANNEL = config.get('EventChannels.LINKED_ORDER_STREAM'),
    redisClient = Redis.createClient(); // TODO: Can this be moved outside of the class?

export class OrderPublisher {

    publishNewOrder(Order){
        redisClient.publish(CHANNEL,Order.serialize());
    }

    publishLinkedOrders(Order1,Order2) {
        redisClient.publish(CHANNEL,JSON.stringify([Order1.serialize(),Order2.serialize()]));
    };
}
