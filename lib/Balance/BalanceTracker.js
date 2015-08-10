import {Balance} from './Balance';
import {RedisWrapper} from '../Wrappers/redisWrapper';
import config from 'config';
import num from 'num';

/**
 * each individual exchange's balance will be stored under the key
 * EXCHANGE_BALANCE_0 (<- 0 is the exchange_id)
 */
let balanceKey = config.get('CacheKeys.EXCHANGE_BALANCE'),
    balanceChannel = config.get('EventChannels.BALANCE_UPDATED');

/**
 * Property name inside of a balance set for USD available for trading
 * @type {string}
 */
let USD_AVAIL = 'usd_avail';
/**
 * Property name inside of a balance set for BTC available for trading
 * @type {string}
 */
let BTC_AVAL  = 'btc_avail';

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
 * Take the provided balance object and set it to redis
 * Publish an event *only* if the balance was *changed*
 * @param {Balance} balanceIn
 */
let setBalanceToRedis = (balanceIn) => {
    let exid = balanceIn.ExchangeId,
        exSpecificBalanceKey = getExSpecificBalanceKey(balanceKey,exid);

    RedisWrapper.getValue(exSpecificBalanceKey,(reply) => {
        let serialized = balanceIn.serialize();
        // there is no balance in redis, lets set the one we passed in
        // hmset is atomic and we are storing each exchange as a unique key
        if(!reply) {
            RedisWrapper.setValue(exSpecificBalanceKey,serialized);
            console.log('SetBalanceToRedis','no balance in redis','hmest balance to redis for',exSpecificBalanceKey,serialized);
            return;//this might have been what was missing/causing errors last time
        }

        let replyBalance = new Balance(reply.exchangeId, reply.usd_avail, reply.btc_avail);

        // if the balance changed
        if(!balanceIn.compare(replyBalance)) {
            console.log('SetBalanceToRedis','the balance changed',exSpecificBalanceKey,serialized);
            // set the provided balance
            RedisWrapper.setValue(exSpecificBalanceKey, serialized);
            // publish an event that the balance was updated
            RedisWrapper.publishValue(balanceChannel, serialized);
        } else {
            console.log('SetBalanceToRedis','the balance did not change for ',exSpecificBalanceKey,'inredis',replyBalance,'trying to set',serialized);
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
let setBalancePropertyToRedis = (balanceIn,balanceProperty) => {
    var exid = balanceIn.ExchangeId;
    var exSpecificBalanceKey = getExSpecificBalanceKey(balanceKey,exid);
    //var toSet = balanceIn[balanceProperty];
    //console.log('SetBalancePropertyToRedis',exSpecificBalanceKey,balanceProperty,toSet);

    // TODO: Fix this / setValue to allow for setting of inner things or blow this whole func away...
    RedisWrapper.setValue(exSpecificBalanceKey,balanceIn.serialize());
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
                    console.log('TrackBalance\'s getBalance had an error ', err);
                    return err;
                }
                console.log('Track Balance Result', result.serialize());
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

        RedisWrapper.getValue(exSpecificBalanceKey,(result) => {
            let outBalance = new Balance(result.exchangeId, result.usd_avail, result.btc_avail);
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

            console.log('IncrementUSDBalance','for exchange',Exchange.getExchangeId(),'by',amount.toString(),'from',resultBalance.getUSDAvailable().toString());
            resultBalance.USDAvailable = resultBalance.USDAvailable.add(amount);
            setBalancePropertyToRedis(resultBalance,USD_AVAIL);
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
            console.log('DecrementUSDBalance','for exchange',Exchange.getExchangeId(),'by',amount.toString(),'from',resultBalance.getUSDAvailable().toString());
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.USDAvailable = 0.0;
            } else {
                resultBalance.USDAvailable = balanceAvailable.sub(amount);
            }
            setBalancePropertyToRedis(resultBalance,USD_AVAIL);
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

            console.log('IncrementBTCBalance','for exchange',Exchange.getExchangeId(),'by',amount.toString(),'from',resultBalance.getBTCAvailable().toString());
            resultBalance.BTCAvailable = resultBalance.BTCAvailable.add(amount);
            setBalancePropertyToRedis(resultBalance,BTC_AVAL);
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
            console.log('DecrementBTCBalance','for exchange',Exchange.getExchangeId(),'by',amount.toString(),'from',resultBalance.getBTCAvailable().toString());
            // if the amount to decrement is bigger then whats available set the balance to 0
            if(amount.cmp(balanceAvailable)===1) {
                resultBalance.BTCAvailable = num(0.0);
                console.log('decrementBTCBalance is setting BTCAvail to 0',resultBalance.serialize());
            } else {
                resultBalance.BTCAvailable = balanceAvailable.sub(amount);
            }
            setBalancePropertyToRedis(resultBalance,BTC_AVAL);
        });
    };
}
