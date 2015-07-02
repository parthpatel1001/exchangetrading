import Redis from "redis";
import {flatten, unflatten} from '../Utilities'

let redisClient = Redis.createClient(),
    channelEventMapping = new Map(); // Need to store the mappings because the on call is async so the value of the initial params were changing

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
        console.log('redisWrapper setting', key, flatten(object));
        //console.log('redisWrapper setting', key, object);
        redisClient.set(key, flatten(object), (err, reply) => {
            if(err) throw err;
        });
    }

    static subscribe(event,callback) {
        //callback = typeof callback == 'function' ? callback : callback.subscribe;

        console.log('redisWrapper subscribe', event);

        if(channelEventMapping.has(event)) {
            let storedCbArray = channelEventMapping.get(event);
            storedCbArray.push(callback);
            channelEventMapping.set(event, storedCbArray);
        } else {
            channelEventMapping.set(event, [ callback ]);
            redisClient.subscribe(event);
        }

        redisClient.on('message', function (channel, message) {
            console.log('redisWrapper message', message, channel, event);
            if(channelEventMapping.has(channel)) {
                let storedCbArray = channelEventMapping.get(channel);
                for(let storedCb of storedCbArray) {
                    storedCb(unflatten(JSON.parse(message)));
                }
            }
        });
    }

    static publishValue(channel, object) {
        console.log('redisWrapper publish', channel, object);
        redisClient.publish(channel, object); // Does this need to be flattened?
    }
}