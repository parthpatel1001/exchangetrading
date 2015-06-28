var config = require('config'),
    num = require('num'),
    Redis = require("redis"),
    Balance = require('./Balance.js');

/**
 * Class BalanceTracker
 * Tracks the balance in redis and has getter/setter methods to make the balance available publicly
 * // TODO figure out better way to inject the Balance class here
 * // TODO This should be renamed to BalanceManager
 * // Pretty annoying because require() is relative/not sure how to do absolute paths
 * @constructor
 */
var BalanceTracker = function(){
    var redisClient = Redis.createClient();
    /**
     * each individual excahnge's balance will be stored under the key
     * EXCHANGE_BALANCE_0 (<- 0 is the exchange_id)
     */
    var balanceKey = config.get('CacheKeys.EXCHANGE_BALANCE');
    var balanceChannel = config.get('EventChannels.BALANCE_UPDATED');

    /**
     * Property name inside of a balance set for USD available for trading
     * @type {string}
     */
    var USD_AVAIL = 'usd_avail';
    /**
     * Property name inside of a balance set for BTC available for trading
     * @type {string}
     */
    var BTC_AVAL  = 'btc_avail';

    /**
     * helper to get the key for where the provided exid's balance is located
     * this is actually a super important function
     * if this changes/and EXCHANGE_BALANCE_{id} gets linked up to the wrong exchange
     * lots of the code below will break
     * // TODO UNIT TEST THIS SHIT
     * @param balKey
     * @param exid
     */
    var getExSpecificBalanceKey = function(balKey,exid) {
        return balKey + '_'+exid;
    };
    /**
     * Take the provided balance object and set it to redis
     * Publish an event *only* if the balance was *changed*
     * @param {Balance} balanceIn
     */
    var setBalanceToRedis = function(balanceIn) {
        var exid = balanceIn.getExchangeId();
        var exSpecificBalanceKey = getExSpecificBalanceKey(balanceKey,exid);

        redisClient.hgetall(exSpecificBalanceKey,function(err,reply){
            if(err){
                console.log('error in redisclient hgetall for: exid: ',exid,err);
                throw err;
            }
            var persistableBalance = balanceIn.getPersistable();
            // there is no balance in redis, lets set the one we passed in
            // hmset is atomic and we are storing each exchange as a unique key
            if(!reply) {
                redisClient.hmset(exSpecificBalanceKey,persistableBalance);
                console.log('SetBalanceToRedis','no balance in redis','hmest balance to redis for',exSpecificBalanceKey,persistableBalance);
                return;//this might have been what was missing/causing errors last time
            }

            // cast the plain js {} to a Balance object
            var replyBalance = new Balance(reply);

            // if the balance changed
            if(!balanceIn.compare(replyBalance)) {
                console.log('SetBalanceToRedis','the balance changed','hmest balance to redis for',exSpecificBalanceKey,persistableBalance);
                // set the provided balance
                redisClient.hmset(exSpecificBalanceKey,balanceIn.getPersistable());
                // publish an event that the balance was updated
                redisClient.publish(balanceChannel,persistableBalance);
            } else {
                console.log('SetBalanceToRedis','the balance did not change for ',exSpecificBalanceKey,'inredis',replyBalance,'trying to set',persistableBalance);
            }
        });
    };

    /**
     * Sets the provided balanceProperty of balanceIn into redis
     * If the property does not exist, it is created and set to amount
     * This should be used over setBalanceToRedis on incr/decr functions to be atomic
     * This uses redis' hset to set a specific key:value
     * vs setBalanceToRedis hmset to set all of the provided object's key:value
     * @param balanceIn
     * @param balanceProperty
     */
    var setBalancePropertyToRedis = function(balanceIn,balanceProperty){
        var exid = balanceIn.getExchangeId();
        var exSpecificBalanceKey = getExSpecificBalanceKey(balanceKey,exid);
        var toSet = balanceIn.getPersistable()[balanceProperty];
        console.log('SetBalancePropertyToRedis',exSpecificBalanceKey,balanceProperty,toSet);
        redisClient.hset(exSpecificBalanceKey,balanceProperty,balanceIn.getPersistable()[balanceProperty]);
    };

    /**
     * Register method, polls the provided exchange every given interval (ms) and updates the balance in redis
     * @param interval
     * @param exch
     */
    this.trackBalance = function(interval,exch){
        setInterval(function(){
            exch.getBalance(function(err,result){
                if(err) {
                    return err;
                }
                console.log('Track Balance Result', result.getPersistable());
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
        var exid = Exchange.getExchangeId();
        var exSpecificBalanceKey = getExSpecificBalanceKey(balanceKey,exid);

        redisClient.hgetall(exSpecificBalanceKey,function(err,result){
            if(err) {
                console.log('error in redisclient hgetall for: exid: ',exid,err);
                throw err; // TODO is it better to throw or do callback(err,null);
            }

            // cast the response to a Balance object
            var outBalance = new Balance(result);

            return callback(null,outBalance);

        });
    };

    /**
     * Increases the provided exchanges USD balance by the provided amount
     * @param Exchange
     * @param amount {num} num() object
     */
    this.incrementUSDBalance = function (Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log('incrementUSDBalance call to retrieveBalance had ERROR', err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to incrementUSD',Exchange);
                return;
            }
            console.log('IncrementUSDBalance','for exchange ',Exchange.getExchangeId(),'by ',amount.toString());
            resultBalance.setUSDAvailable(resultBalance.getUSDAvailable().add(amount));
            setBalancePropertyToRedis(resultBalance,USD_AVAIL);


        });
    };
    /**
     * Decreases the provided exchanges USD balance by the provided amount
     * Will not set < 0
     * @param Exchange
     * @param amount {num}
     */
    this.decrementUSDBalance = function(Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log('decrementUSDBalance call to retrieveBalance had ERROR', err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to decrementUSD',Exchange);
                return;
            }

            var balanceAvailable = resultBalance.getUSDAvailable();
            // if the balance is already 0, don't do anything
            if(balanceAvailable.cmp(0) == 0) {
                console.log('decrementUSDBalance was trying to change balance but exchangeId ' + Exchange.getExchangeId()+' bal was already 0');
                return;
            }
            console.log('DecrementUSDBalance','for exchange ',Exchange.getExchangeId(),'by ',amount.toString());
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.setUSDAvailable(num(0.0));
            } else {
                resultBalance.setUSDAvailable(balanceAvailable.sub(amount));
            }
            setBalancePropertyToRedis(resultBalance,USD_AVAIL);
        });
    };

    /**
     * Increases the provided exchanges BTC balance by the provided amount
     * @param Exchange
     * @param amount {num}
     */
    this.incrementBTCBalance = function(Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log('incrementBTCBalance call to retrieveBalance had ERROR', err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to increment BTC',Exchange);
                return;
            }
            console.log('IncrementBTCBalance','for exchange ',Exchange.getExchangeId(),'by ',amount.toString());
            resultBalance.setBTCAvailable(resultBalance.getBTCAvailable().add(amount));
            setBalancePropertyToRedis(resultBalance,BTC_AVAL);
        });
    };

    /**
     * Decreases the provided exchanges BTC balance by the provided amount
     * Will not set < 0
     * @param Exchange
     * @param amount {num}
     */
    this.decrementBTCBalance = function(Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log('decrementBTCBalance call to retrieveBalance had ERROR', err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to decrement BTC',Exchange);
                return;
            }

            var balanceAvailable = resultBalance.getBTCAvailable();
            // if the balance is already 0, don't do anything
            if(balanceAvailable.cmp(0) == 0) {
                console.log(Exchange.getExchangeId()+' exchange balance already 0');
                return;
            }
            console.log('DecrementBTCBalance','for exchange ',Exchange.getExchangeId(),'by ',amount.toString());
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.setBTCAvailable(num(0.0));
            } else {
                resultBalance.setBTCAvailable(balanceAvailable.sub(amount));
            }
            setBalancePropertyToRedis(resultBalance,BTC_AVAL);
        });
    };
};

module.exports = exports = BalanceTracker;