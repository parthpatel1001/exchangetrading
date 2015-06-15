import async from 'async';
import config from 'config';
import pm2 from 'pm2';
import {Notification} from './Notification'; // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER

var
    CoinbaseOrderBook = require('../lib/Exchange/Coinbase/CoinbaseOrderBook.js'),
    BitstampOrderBook = require('../lib/Exchange/Bitstamp/BitstampOrderBook.js'),
    OrderBookManager  = require('../lib/OrderBook/OrderBookManager.js'),
    OrderBookPusher  = require('../lib/OrderBook/OrderBookPusher.js');

OrderBookManager = new OrderBookManager();
OrderBookManager.addOrderBook(new CoinbaseOrderBook());
OrderBookManager.addOrderBook(new BitstampOrderBook());
OrderBookPusher = new OrderBookPusher(OrderBookManager);

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
        () => { notifier.message(error,opts);}
    ]);
});

