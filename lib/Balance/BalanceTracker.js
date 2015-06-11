/**
 * Created by parthpatel1001 on 5/24/15.
 */
var config = require('config');
var num = require('num');

/**
 * Class BalanceTracker
 * Tracks the balance in redis and has getter/setter methods to make the balance available publicly
 * // TODO figure out better way to inject the Balance class here
 * // TODO This should be renamed to BalanceManager
 * // Pretty annoying because require() is relative/not sure how to do absolute paths
 * @param Redis
 * @param Balance
 * @constructor
 */
var BalanceTracker = function(Redis,Balance){
    var RedisClient = Redis.createClient();
    /**
     * each individual excahnge's balance will be stored under the key
     * EXCHANGE_BALANCE_0 (<- 0 is the exchange_id)
     */
    var balanceKey = config.get('CacheKeys.EXCHANGE_BALANCE');
    var balanceChannel = config.get('EventChannels.BALANCE_UPDATED');

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

        RedisClient.hgetall(exSpecificBalanceKey,function(err,reply){
            if(err){
                console.log('error in redisclient hgetall for: exid: ',exid,err);
                throw err;
            }
            var persistableBalance = balanceIn.getPersistable();
            // there is no balance in redis, lets set the one we passed in
            // hmset is atomic and we are storing each exchange as a unique key
            if(!reply) {
                RedisClient.hmset(exSpecificBalanceKey,persistableBalance);
                return;//this might have been what was missing/causing errors last time
            }

            // cast the plain js {} to a Balance object
            var replyBalance = new Balance(reply);

            // if the balance changed
            if(!balanceIn.compare(replyBalance)) {
                // set the provided balance
                RedisClient.hmset(exSpecificBalanceKey,balanceIn.getPersistable());
                // publish an event that the balance was updated
                RedisClient.publish(balanceChannel,persistableBalance);
            }
        });
    };

    /**
     * Register method, polls the provided exchange every given interval (ms) and updates the balance in redis
     * @param interval
     * @param Exchange
     */
    this.trackBalance = function(interval,Exchange){
        setInterval(function(){
            Exchange.getBalance(Balance,function(err,result){
                if(err) {
                    return err;
                }
                console.log(result.getPersistable());
                return setBalanceToRedis(result);
            });
        },interval);
    };

    /**
     * Get the balance for the provided exchange in Redis
     * @param callback gets passed (Balance) with the values hydrated | must accept callback(err,Balance)
     * @param Exchange exchange instance
     */
    this.retrieveBalance = function(Exchange,callback){
        var exid = Exchange.getExchangeId();
        var exSpecificBalanceKey = getExSpecificBalanceKey(balanceKey,exid);

        RedisClient.hgetall(exid,function(err,result){
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
     * @param amount num() object
     */
    this.incrementUSDBalance = function (Exchange,amount) {
        this.retrieveBalance(Exchange,function(err,resultBalance){
            if(err){
                console.log(err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to incrementUSD',Exchange);
                return;
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
                console.log(err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to decrementUSD',Exchange);
                return;
            }

            var balanceAvailable = resultBalance.getUSDAvailable();
            // if the balance is already 0, don't do anything
            if(balanceAvailable.cmp(0) == 0) {
                console.log(Exchange.getExchangeId()+' exchange balance already 0');
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
                console.log(err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to increment BTC',Exchange);
                return;
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
                console.log(err);
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
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.setBTCAvailable(num(0.0));
                console.log('here',resultBalance.serialize());
            } else {
                resultBalance.setBTCAvailable(balanceAvailable.sub(amount));
            }
            setBalanceToRedis(resultBalance);
        });
    };
};

module.exports = exports = BalanceTracker;