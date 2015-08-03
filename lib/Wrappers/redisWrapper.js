import Redis from "redis-mock"; //import Redis from "redis"; //redisWrapper should not assume which client will be use and should be set explicitly using setClient, in the case of tests will error out if no redis daemon is running
import {Flatten, Unflatten} from '../Utilities/Serializer'

let
    /**
     * {Redis}
     */
    redisClient = Redis.createClient(),
    channelEventMapping = new Map(); // Need to store the mappings because the on call is async so the value of the initial params were changing

export class RedisWrapper {
    /**
     * Allow setting which client you want to use at runtime for unit tests
     * @param {Redis} client
     */
    static setClient(client) {
        if(redisClient !== null) {
            redisClient.end();
        }
        redisClient = client;
    }

    /**
     * @returns {Redis}
     */
    static getClient(){
        return redisClient;
    }

    static end() {
        channelEventMapping.clear();
        redisClient.end();
    }

    static getValue(key, callback) {
        redisClient.get(key,(err,reply) => {
            if(err) throw err;
            return callback(Unflatten(JSON.parse(reply))); // Should callback have another param? It returns and event in event.js
        });
    }

    static setValue(key, object) {
        redisClient.set(key, JSON.stringify(Flatten(object)), (err, reply) => {
            if(err) throw err;
        });
    }

    static subscribe(event,callback) {
        let callbackCaller = (channel, message) => {
            if(channelEventMapping.has(channel)) {
                let storedCbArray = channelEventMapping.get(channel);

                for(let storedCb of storedCbArray) {
                    storedCb(Unflatten(JSON.parse(message)));
                }
            }
        };

        if(channelEventMapping.has(event)) {
            let storedCbArray = channelEventMapping.get(event);
            storedCbArray.push(callback);
            channelEventMapping.set(event, storedCbArray);
        } else {
            channelEventMapping.set(event, [ callback ]);

            // once done storing the callback in the list, register the subscribe
            // but only when we're subscribing to an event for the first time

            // this might have things blow up
            // because once you do Redis.subscribe
            // you cant do Redis.set() w/ the same connection
            // our app/process separation might have accidentally handled this though
            redisClient.subscribe(event);
        }

        redisClient.on('message', callbackCaller);
    }

    static publishValue(channel, object) {
        redisClient.publish(channel, JSON.stringify(Flatten(object))); // Does this need to be flattened?
    }
}