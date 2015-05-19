/**
 * Created by parthpatel1001 on 5/14/15.
 */

var OrderBookPusher = function (OrderBookManager,RedisClient)
{
    var Redis = RedisClient.createClient();

    this.subscribeOrderBookToRedis = function (KEY,CHANNEL) {
        OrderBookManager.subscribeToOrderBooks(function(orderBookTop){
            var book = JSON.stringify(orderBookTop);

            Redis.get(KEY,function(err,reply){
                if(err) {
                    console.log('Redis Get err: '+err);
                    return;
                }
                // only push a message if the book has changed
                if(reply != book) {
                    Redis.set(KEY,book);
                    Redis.publish(CHANNEL,book);
                }
            });

        });
    };
};

module.exports = exports = OrderBookPusher;