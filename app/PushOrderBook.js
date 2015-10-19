import 'babel/polyfill';
import async from 'async';
import config from 'config';
import pm2 from 'pm2';
import {OrderBookManager} from './OrderBook/OrderBookManager';
import {CoinbaseOrderBook} from './Exchange/Coinbase/CoinbaseOrderBook';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampOrderBook} from './Exchange/Bitstamp/BitstampOrderBook';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';
import {OrderBookPusher} from './OrderBook/OrderBookPusher.js';
import {Notification, NotificationLevels} from './Notification';
import {RedisWrapper} from './Wrappers/redisWrapper';

Notification.eventTriggered("Application Start Up", { AppName: "PushOrderBook" }, "", NotificationLevels.HIGH);

let orderBookManager = new OrderBookManager();
// TODO: Are the exchanges really necessary to pass through here? Meaning do the order books really need an exchange prop?
orderBookManager.addOrderBook(new CoinbaseOrderBook(new CoinbaseExchange()));
orderBookManager.addOrderBook(new BitstampOrderBook(new BitstampExchange()));

let orderBookPusher = new OrderBookPusher(orderBookManager);

// Potential TODO: Move this into it's own file / class that can be require'd / init'd by all of the app files?
var notifier = new Notification();
var opts = config.get('Notification.Slack.error_config');
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

// restart the order book every 10 minutes
setTimeout(function(){
    // delete the redis key
    RedisWrapper.deleteValue(config.get('CacheKeys.ORDER_BOOK_TOP'));
    // restart
    pm2.connect((err) => {
        pm2.restart('OrderBookPusher');
    });

},60000);
