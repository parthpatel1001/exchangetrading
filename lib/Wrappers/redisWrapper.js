import Redis from "redis";
import {Flatten, Unflatten} from '../Utilities/Serializer'

let
    /**
     * {Redis}
     */
    redisClient = null,
    channelEventMapping = new Map(); // Need to store the mappings because the on call is async so the value of the initial params were changing

export class RedisWrapper {
    /**
     * Allow setting which client you want to use at runtime for unit tests
     * @param {Redis} client
     */
    static setClient(client) {
        redisClient = client;
    }

    /**
     * This sucks because in prod we have to do an extra comparison every time we get a client
     * @returns {Redis}
     */
    static getClient(){
        if(!redisClient) {
            redisClient = Redis.createClient();
        }
        return redisClient;
    }

    static getValue(key, callback) {
        console.log('redisWrapper getting', key);
        redisClient.get(key,(err,reply) => {
            if(err) throw err;
            console.log('redisWrapper got', key, reply);
            return callback(Unflatten(JSON.parse(reply))); // Should callback have another param? It returns and event in event.js
        });
    }

    static setValue(key, object) {
        console.log('redisWrapper setting', key, JSON.stringify(Flatten(object)));
        redisClient.set(key, JSON.stringify(Flatten(object)), (err, reply) => {
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
        }
        // once done storing the callback in the list, register the subscribe
        // this might have things blow up
        // because once you do Redis.subcribe
        // you cant do Redis.set() w/ the same connection
        // our app/process seperation might have accidentally handled this though
        redisClient.subscribe(event);

        redisClient.on('message', function (channel, message) {
            console.log('on channel', channel, event);
            console.log(' redisWrapper recieved message', message);
            console.log(' parsed message',Unflatten(JSON.parse(message)));

            if(channelEventMapping.has(channel)) {
                console.log('has %s subscribed',channel);
                let storedCbArray = channelEventMapping.get(channel);
                for(let storedCb of storedCbArray) {
                    storedCb(Unflatten(JSON.parse(message)));
                }
            }
        });
    }

    static publishValue(channel, object) {
        console.log('redisWrapper publish', channel, object,JSON.stringify(Flatten(object)));
        redisClient.publish(channel, JSON.stringify(Flatten(object))); // Does this need to be flattened?
    }
}