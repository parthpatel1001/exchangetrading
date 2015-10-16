import Redis from "redis";
import {Flatten, Unflatten} from '../Utilities/Serializer'

let
    /**
     * {Redis}
     */
    redisPublishingClient = null,
    redisSubscribingClient = null,
    channelEventMapping = new Map(); // Need to store the mappings because the on call is async so the value of the initial params were changing

let callbackCaller = (channel, message) => {
    if(channelEventMapping.has(channel)) {
        let storedCbArray = channelEventMapping.get(channel);

        for(let storedCb of storedCbArray) {
            storedCb(Unflatten(JSON.parse(message)));
        }
    }
};

let initClients = (publishingClient, subscribingClient) => {
    if(publishingClient !== null) {
        if(redisPublishingClient !== null) {
            redisPublishingClient.end();
        }

        redisPublishingClient = publishingClient;
    }
    if(subscribingClient !== null) {
        if(redisSubscribingClient !== null) {
            redisPublishingClient.end();
        }

        redisSubscribingClient = subscribingClient;
        redisSubscribingClient.on('message', callbackCaller);
    }

    channelEventMapping.clear();
};

initClients(Redis.createClient(), Redis.createClient());

export class RedisWrapper {
    /**
     * Allow setting which client you want to use at runtime for unit tests
     * @param {Redis} client
     */
    static setClients(publishingClient, subscribingClient) {
        initClients(publishingClient, subscribingClient);
    }

    static getValue(key, callback) {
        redisPublishingClient.get(key,(err,reply) => {
            if(err) throw err;
            return callback(Unflatten(JSON.parse(reply))); // Should callback have another param? It returns and event in event.js
        });
    }

    static setValue(key, object) {
        redisPublishingClient.set(key, JSON.stringify(Flatten(object)), (err, reply) => {
            if(err) throw err;
        });
    }

    static subscribe(event,callback) {
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

            // TODO: To solve the above comment, should we call initClient(redisClient) here? Not entirely sure that will work though.

            redisSubscribingClient.subscribe(event);
        }
    }

    static publishValue(channel, object) {
        redisPublishingClient.publish(channel, JSON.stringify(Flatten(object))); // Does this need to be flattened?
    }

    static deleteValue(key) {
        redisPublishingClient.del(key);
    }
}
