import {Balance} from './Balance';
import config from 'config';
import Redis from 'redis';
import num from 'num';

let redisClient = Redis.createClient(),
    /**
     * each individual excahnge's balance will be stored under the key
     * EXCHANGE_BALANCE_0 (<- 0 is the exchange_id)
     */
    balanceKey = config.get('CacheKeys.EXCHANGE_BALANCE'),
    balanceChannel = config.get('EventChannels.BALANCE_UPDATED');

/**
 * Take the provided balance object and set it to redis
 * Publish an event *only* if the balance was *changed*
 * @param {Balance} balanceIn
 */
let setBalanceToRedis = (balanceIn) => {
    let exid = balanceIn.ExchangeId,
        exSpecificBalanceKey = getExSpecificBalanceKey(balanceKey,exid);

    redisClient.hgetall(exSpecificBalanceKey,function(err,reply){
        if(err){
            console.log('error in redisclient hgetall for: exid: ',exid,err);
            throw err;
        }
        let persistableBalance = balanceIn.Persistable;
        // there is no balance in redis, lets set the one we passed in
        // hmset is atomic and we are storing each exchange as a unique key
        if(!reply) {
            redisClient.hmset(exSpecificBalanceKey,persistableBalance);
            return;//this might have been what was missing/causing errors last time
        }

        let replyBalance = new Balance(reply.usd_avail, reply.btc_avail, reply.exchangeId);

        // if the balance changed
        if(!balanceIn.compare(replyBalance)) {
            // set the provided balance
            redisClient.hmset(exSpecificBalanceKey, persistableBalance);
            // publish an event that the balance was updated
            redisClient.publish(balanceChannel, persistableBalance);
        }
    });
};


/**
 * helper to get the key for where the provided exid's balance is located
 * this is actually a super important function
 * if this changes/and EXCHANGE_BALANCE_{id} gets linked up to the wrong exchange
 * lots of the code below will break
 * // TODO UNIT TEST THIS SHIT
 * @param balKey
 * @param exid
 */
let getExSpecificBalanceKey = (balKey,exid) => {
    return balKey + '_'+exid;
};

/**
 * Class BalanceTracker
 * Tracks the balance in redis and has getter/setter methods to make the balance available publicly
 * // TODO This should be renamed to BalanceManager
 * @constructor
 */
export class BalanceTracker {
    /**
     * Register method, polls the provided exchange every given interval (ms) and updates the balance in redis
     * @param interval
     * @param exch
     */
    trackBalance(interval,exch){
        setInterval(() => {
            exch.getBalance((err,result) => {
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
     * @param exch exchange instance
     * @param callback gets passed (Balance) with the values hydrated | must accept callback(err,Balance)
     */
    retrieveBalance(exch,callback){
        let exid = exch.ExchangeId,
            exSpecificBalanceKey = getExSpecificBalanceKey(balanceKey,exid);

        redisClient.hgetall(exSpecificBalanceKey,(err,result) => {
            if(err) {
                console.log('error in redisclient hgetall for: exid: ',exid,err);
                throw err; // TODO is it better to throw or do callback(err,null);
            }

            let outBalance = new Balance(result.usd_avail, result.btc_avail, result.exchangeId);

            return callback(null,outBalance);
        });
    }

    /**
     * Increases the provided exchanges USD balance by the provided amount
     * @param exch
     * @param amount num() object
     */
    incrementUSDBalance(exch, amount) {
        this.retrieveBalance(exch, (err,resultBalance) => {
            if(err){
                console.log('incrementUSDBalance call to retrieveBalance had ERROR', err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to incrementUSD',exch);
                return;
            }

            resultBalance.USDAvailable = resultBalance.USDAvailable.add(amount);
            setBalanceToRedis(resultBalance);
        });
    }

    /**
     * Decreases the provided exchanges USD balance by the provided amount
     * Will not set < 0
     * @param exch
     * @param amount
     */
    decrementUSDBalance(exch,amount) {
        this.retrieveBalance(exch,(err,resultBalance) => {
            if(err){
                console.log('decrementUSDBalance call to retrieveBalance had ERROR', err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to decrementUSD',exch);
                return;
            }

            let balanceAvailable = resultBalance.USDAvailable;
            // if the balance is already 0, don't do anything
            if(balanceAvailable.cmp(0) == 0) {
                console.log('decrementUSDBalance was trying to change balance but exchangeId ' + exch.ExchangeId + ' bal was already 0');
                return;
            }
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.USDAvailable = 0.0;
            } else {
                resultBalance.USDAvailable = balanceAvailable.sub(amount);
            }
            setBalanceToRedis(resultBalance);
        });
    }

    /**
     * Increases the provided exchanges BTC balance by the provided amount
     * @param exch
     * @param amount
     */
    incrementBTCBalance(exch, amount) {
        this.retrieveBalance(exch, (err,resultBalance) => {
            if(err){
                console.log('incrementBTCBalance call to retrieveBalance had ERROR', err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to increment BTC',exch);
                return;
            }

            resultBalance.BTCAvailable = resultBalance.BTCAvailable.add(amount);
            setBalanceToRedis(resultBalance);
        });
    }

    /**
     * Decreases the provided exchanges BTC balance by the provided amount
     * Will not set < 0
     * @param exch
     * @param amount
     */
    decrementBTCBalance(exch,amount) {
        this.retrieveBalance(exch, (err,resultBalance) => {
            if(err){
                console.log('decrementBTCBalance call to retrieveBalance had ERROR', err);
                throw err;
            }

            if(!resultBalance) {
                console.log('no balance in redis to decrement BTC',exch);
                return;
            }

            var balanceAvailable = resultBalance.BTCAvailable;
            // if the balance is already 0, don't do anything
            if(balanceAvailable.cmp(0) == 0) {
                console.log(exch.ExchangeId + ' exchange balance already 0');
                return;
            }
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.BTCAvailable = num(0.0);
                console.log('decrementBTCBalance is setting BTCAvail to 0',resultBalance.serialize());
            } else {
                resultBalance.BTCAvailable = balanceAvailable.sub(amount);
            }
            setBalanceToRedis(resultBalance);
        });
    };
}
