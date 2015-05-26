/**
 * Created by parthpatel1001 on 5/24/15.
 */
var config = require('config');

var BalanceTracker = function(Redis,Balance){
    var RedisClient = Redis.createClient();
    var balanceKey = config.get('CacheKeys.EXCHANGE_BALANCE');
    var balanceChannel = config.get('EventChannels.BALANCE_UPDATED');

    var setBalanceToRedis = function(Balance){
        var current = Balance.serialize();
        RedisClient.get(balanceKey,function(err,reply){
            if(err){
                return err;
            }
            // if the key is not there redis is empty, initialize it
            if(!reply) {
                var newToRedis = [];
                newToRedis[Balance.getExchangeId()] = current;
                newToRedis = JSON.stringify(newToRedis);
                RedisClient.set(balanceKey,newToRedis);
                RedisClient.publish(balanceChannel,newToRedis);
                return;
            }

            // parse the response from redis
            var replyBalance = JSON.parse(reply);
            // get this exchanges balance from the response
            var inRedisBalance = replyBalance[Balance.getExchangeId()];

            // if the current exchange balance != the exchange balance in redis
            if(current != inRedisBalance) {
                // update the balance in redis
                replyBalance[Balance.getExchangeId()] = current;
                var toRedis = JSON.stringify(replyBalance);
                RedisClient.set(balanceKey,toRedis);
                // publish an event that the balance was updated
                RedisClient.publish(balanceChannel,toRedis);
            }
        });
    };

    this.trackBalance = function(interval,Exchange){
        setInterval(function(){
            Exchange.getBalance(Balance,function(err,result){
                if(err) {
                    return err;
                }
                return setBalanceToRedis(result);
            });
        },interval);
    };
};

module.exports = exports = BalanceTracker;