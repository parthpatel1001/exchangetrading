import Redis from 'redis';
import {Order} from './Order.js';

let redisClient = Redis.createClient();

export class OrderSubscriber {
    subscribeToOrderStream(CHANNEL,callback){
        redisClient.subscribe(CHANNEL);
        redisClient.on("message",function(channel,message){
            callback(new Order(JSON.parse(message)));
        });
    }

    subscribeToLinkedOrderStream(CHANNEL,callback) {
        redisClient.subscribe(CHANNEL);
        redisClient.on("message",function(channel,message){
            message = JSON.parse(message);
            callback(new Order(JSON.parse(message[0])),new Order(JSON.parse(message[1])));
        });
    };
}
