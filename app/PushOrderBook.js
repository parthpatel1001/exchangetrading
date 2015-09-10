import 'babel/polyfill';
import async from 'async';
import config from 'config';
import pm2 from 'pm2';
import {OrderBookManager} from './OrderBook/OrderBookManager';
import {CoinbaseOrderBookTranslator} from './OrderBook/Translators/Coinbase';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampOrderBookTranslator} from './OrderBook/Translators/Bitstamp';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';
import {OrderBookPusher} from './OrderBook/OrderBookPusher.js';
import {Notification, NotificationLevels} from './Notification';

Notification.eventTriggered("Application Start Up", { AppName: "PushOrderBook" }, "", NotificationLevels.HIGH);

let orderBookManager = new OrderBookManager();
// TODO: Are the exchanges really necessary to pass through here? Meaning do the order books really need an exchange prop?
orderBookManager.addOrderBook(new CoinbaseOrderBookTranslator());
orderBookManager.addOrderBook(new BitstampOrderBookTranslator());

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

