/**
 * Created by parthpatel1001 on 5/24/15.
 */
var config = require('config');
var num = require('num');

/**
 * Class BalanceTracker
 * Tracks the balance in redis and has getter/setter methods to make the balance available publicly
 * // TODO figure out better way to inject the Balance class here
 * // Pretty annoying because require() is relative/not sure how to do absolute paths
 * @param Redis
 * @param Balance
 * @param Exchanges
 * @constructor
 */
var BalanceTracker = function(Redis,Balance, Exchanges){
    var RedisClient = Redis.createClient();
    var balanceKey = config.get('CacheKeys.EXCHANGE_BALANCE');
    var balanceChannel = config.get('EventChannels.BALANCE_UPDATED');
    var exchanges = Exchanges;
    var balance = Balance;

    /**
     * Take the provided balance object and set it to redis
     * Publish an event *only* if the balance was *changed*
     * @param Balance
     */
    var setBalanceToRedis = function(bal){
        var current = bal.serialize();
        RedisClient.get(balanceKey,function(err,reply){
            // If there's an error or there was no reply
            // The reply is expected because it should be initially save to redis on construction
            if(err || !reply){
                // TODO make an error logger
                return err;
            }

            // parse the response from redis
            var replyBalance = JSON.parse(reply);
            // get this exchanges balance from the response
            var inRedisBalance = replyBalance[bal.getExchangeId()];

            // if the current exchange balance != the exchange balance in redis
            if(current != inRedisBalance) {
                // update the balance in redis
                replyBalance[bal.getExchangeId()] = current;
                var toRedis = JSON.stringify(replyBalance);
                RedisClient.set(balanceKey,toRedis);
                // publish an event that the balance was updated
                RedisClient.publish(balanceChannel,toRedis);
            }
        });
    };

    /**
     * Register method, polls the provided exchange every given interval (ms) and updates the balance in redis
     * @param interval
     * @param exch
     */
    this.trackBalance = function(interval,exch){
        setInterval(function(){
            exch.getBalance(balance, function(err,result){
                if(err) {
                    return err;
                }
                console.log('Track Balance Result', result.serialize());
                return setBalanceToRedis(result);
            });
        }, interval);
    };

    /**
     * Get the balance for the provided exchange in Redis
     * @param Exchange exchange instance
     * @param callback gets passed (Balance) with the values hydrated | must accept callback(err,Balance)
     */
    this.retrieveBalance = function(Exchange,callback){
        RedisClient.get(balanceKey,function(err,reply){
            if(err) {
                // TODO make an error logger
                return callback(err);
            }
            // no balance yet in redis
            if(!reply) {
                return callback(null,num(0.0));
            }
            // balance in redis as a json encoded array
            var replyBalance = JSON.parse(reply);
            // each element is a json encoded Balance object
            var outBalance = new Balance(JSON.parse(replyBalance[Exchange.getExchangeId()]));

            // guarantee we have the right exchange id and are looking at the right balance
            if(!outBalance || outBalance.getExchangeId() != Exchange.getExchangeId()) {
                // TODO Decide whether its better to throw here or pass the error up
                // TODO this would be solved if we were using Redis.hmset() instead of Redis.set(JSON.stringify({}))
                // TODO Throw a nuke switch error here. If the balances are fucked up bad things are happening
                throw new Error('Redis Exchange Balance ids not in the right order: inRedis: '+outBalance.exchangeId+' looking for '+Exchange.getExchangeId());
            }

            return callback(null,outBalance);

        });
    };

    /**
     * Increases the provided exchanges USD balance by the provided amount
     * @param Exchange
     * @param amount num() object
     */
    this.incrementUSDBalance = function (Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log('incrementUSDBalance call to retrieveBalance had ERROR', err);
                throw err;
            }
            resultBalance.setUSDAvailable(resultBalance.getUSDAvailable().add(amount));
            setBalanceToRedis(resultBalance);
        });
    };
    /**
     * Decreases the provided exchanges USD balance by the provided amount
     * Will not set < 0
     * @param Exchange
     * @param amount
     */
    this.decrementUSDBalance = function(Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log('decrementUSDBalance call to retrieveBalance had ERROR', err);
                throw err;
            }
            var balanceAvailable = resultBalance.getUSDAvailable();
            // if the balance is already 0, don't do anything
            if(balanceAvailable.cmp(0) == 0) {
                console.log('decrementUSDBalance was trying to change balance but exchangeId ' + Exchange.getExchangeId()+' bal was already 0');
                return;
            }
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.setUSDAvailable(num(0.0));
            } else {
                resultBalance.setUSDAvailable(balanceAvailable.sub(amount));
            }
            setBalanceToRedis(resultBalance);
        });
    };

    /**
     * Increases the provided exchanges BTC balance by the provided amount
     * @param Exchange
     * @param amount
     */
    this.incrementBTCBalance = function(Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log('incrementBTCBalance call to retrieveBalance had ERROR', err);
                throw err;
            }
            resultBalance.setBTCAvailable(resultBalance.getBTCAvailable().add(amount));
            setBalanceToRedis(resultBalance);
        });
    };

    /**
     * Decreases the provided exchanges BTC balance by the provided amount
     * Will not set < 0
     * @param Exchange
     * @param amount
     */
    this.decrementBTCBalance = function(Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log('decrementBTCBalance call to retrieveBalance had ERROR', err);
                throw err;
            }
            var balanceAvailable = resultBalance.getBTCAvailable();
            // if the balance is already 0, don't do anything
            if(balanceAvailable.cmp(0) == 0) {
                console.log(Exchange.getExchangeId()+' exchange balance already 0');
                return;
            }
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.setBTCAvailable(num(0.0));
            } else {
                resultBalance.setBTCAvailable(balanceAvailable.sub(amount));
            }
            setBalanceToRedis(resultBalance);
        });
    };


    // Initialize the exchanges by hand to ensure that they all get added initially
    var newToRedis = [],
        i = 0,
        len = exchanges.length;
    for(; i < len; i++) {
        exchanges[i].getBalance(balance, function(err,result){
            if(err) {
                return err;
            }
            newToRedis.push(result.serialize()); // Serialize the bal here to make the stringify below work as expected

            // As this is async, we need to ensure that the newToRedis has all the expected balances before it's saved out
            // TODO: This is being called twice (once by OrderProcessor and once by TrackBalance)
            // TODO: This should be a async.all call somehow... Need to redo the getBalance to get that to work
            if(newToRedis.length === len) {
                console.log('Initializing the Exchange Balances with', newToRedis);
                newToRedis = JSON.stringify(newToRedis);
                RedisClient.set(balanceKey,newToRedis);
                RedisClient.publish(balanceChannel,newToRedis);
            }
        });
    }

};

module.exports = exports = BalanceTracker;
