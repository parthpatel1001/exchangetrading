/**
 * Created by parthpatel1001 on 5/14/15.
 */

var
    Redis = require("redis"),
    CoinbaseOrderBook = require('../lib/Exchange/Coinbase/CoinbaseOrderBook.js'),
    BitstampOrderBook = require('../lib/Exchange/Bitstamp/BitstampOrderBook.js'),
    OrderBookManager  = require('../lib/OrderBook/OrderBookManager.js'),
    OrderBookPusher  = require('../lib/OrderBook/OrderBookPusher.js'),
    config = require('config'),
    Slack = require('../lib/Slack/SlackMessenger.js'),
    Notification = require('../lib/Notification.js'), // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER
    async = require('async'),
    pm2 = require('pm2');


var notifier = new Notification(new Slack());
var opts = config.get('Notification.Slack.error_config');

new OrderBookPusher(
    new OrderBookManager()
        .addOrderBook(new CoinbaseOrderBook(config.get('Exchange.Coinbase.id')))
        .addOrderBook(new BitstampOrderBook(config.get('Exchange.Bitstamp.id'))),
    Redis
)
    .subscribeOrderBookToRedis(config.get('CacheKeys.ORDER_BOOK_TOP'),config.get('EventChannels.ORDER_BOOK_TICK'));

process.on('uncaughtException', function (e) {
    console.error('Uncaught Excception',e);
    var error = e.toString() || JSON.stringify(e);

    async.parallel([
        function(){
            pm2.connect(function(err){
                pm2.restart('OrderBookPusher'); // TODO make this a config, tricky because pm2 wants its own app declaration file
                notifier.message("Restarted OrderBookPusher",opts);
                console.log('Restarted OrderBookPusher');
            });
        },
        function(){ notifier.message("Exception thrown in *PushOrderBook* ",opts); },
        function(){ notifier.message(error,opts);}
    ]);
});

