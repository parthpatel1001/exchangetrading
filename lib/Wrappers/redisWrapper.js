import Redis from "redis";
import {flatten, unflatten} from '../Utilities'

let redisClient = Redis.createClient();

export class RedisWrapper {
    static getValue(key, callback) {
        console.log('redisWrapper getting', key);
        redisClient.hgetall(key,(err,reply) => {
            if(err) throw err;
            console.log('redisWrapper got', key, reply);
            return callback(unflatten(JSON.parse(reply))); // Should callback have another param? It returns and event in event.js
        });
    }

    static setValue(key, object) {
        console.log('redisWrapper setting', key, object);
        redisClient.hmset(key, flatten(object));
    }

    static subscribe(event,callback) {
        //callback = typeof callback == 'function' ? callback : callback.subscribe;

        console.log('redisWrapper subscribe', event);
        redisClient.subscribe(event);
        redisClient.on('message', function (channel, message) {
            if (channel == event) {
                callback(unflatten(JSON.parse(data)));
            }
        });
    }

    static publishValue(channel, object) {
        console.log('redisWrapper publish', channel, object);
        redisClient.publish(channel, object); // Does this need to be flattened?
    }
}