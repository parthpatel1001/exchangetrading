import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {Notification, NotificationLevels} from './Notification';
import config from 'config';
import {RedisWrapper} from './Wrappers/redisWrapper';

var notifier = new Notification();
var ex = new CoinbaseExchange();
var opts = config.get('Notification.Slack.error_config');



setInterval(function(){
    ex.getOpenOrders(function(orders){
        console.log(orders);
        var now = new Date(),
            orders_to_cancel = [];
        for(var i in orders) {
            var submited_at = Date.parse(orders[i].created_at);
            if (now - submited_at > 60000) {
                orders_to_cancel.push(orders[i].id);
                ex.cancelOrder(orders[i].id,function(err,response,data){
                    if(err) {
                        console.log('Canceled orders ,',orders[i].id,', result:',err,response,data);
                    } else {
                        console.log('Canceled order result:',data);
                    }

                });
            }
        }

        if(orders_to_cancel.length > 0) {
            notifier.message('Canceled '+orders_to_cancel.length,opts);
            console.log('Canceled orders: ');
            console.log(orders_to_cancel);
            //notifier.message('Canceled ids: '+JSON.stringify(orders_to_cancel));
        }

    });
},5000);

process.on('uncaughtException', function (e) {
    console.error('PushOrderBook App Uncaught Exception',e);
    var error = e.toString() || JSON.stringify(e);

    async.parallel([
        () =>{
            pm2.connect((err) => {
                pm2.restart('OrderBookPusher'); // TODO make this a config, tricky because pm2 wants its own app declaration file
                notifier.message("Restarted OrderBookPusher",opts);
                console.log('Restarted OrderBookPusher');
            });
        },
        () => { notifier.message("Exception thrown in *PushOrderBook* ",opts); },
        () => { notifier.message("Error: " + error,opts);},
        () => { notifier.message("Trace: " + e.stack,opts);}
    ]);
});

