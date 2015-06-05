var
    CoinbaseOrderBook = require('../lib/Exchange/Coinbase/CoinbaseOrderBook.js'),
    BitstampOrderBook = require('../lib/Exchange/Bitstamp/BitstampOrderBook.js'),
    OrderBookManager  = require('../lib/OrderBook/OrderBookManager.js'),
    OrderBookPusher  = require('../lib/OrderBook/OrderBookPusher.js'),
    config = require('config'),
    Slack = require('../lib/Slack/SlackMessenger.js'),
    Notification = require('../lib/Notification.js'), // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER
    async = require('async'),
    pm2 = require('pm2');

OrderBookManager = new OrderBookManager();
OrderBookManager.addOrderBook(new CoinbaseOrderBook());
OrderBookManager.addOrderBook(new BitstampOrderBook());
OrderBookPusher = new OrderBookPusher(OrderBookManager);

// Potential TODO: Move this into it's own file / class that can be require'd / init'd by all of the app files?
var notifier = new Notification(new Slack());
var opts = config.get('Notification.Slack.error_config');
process.on('uncaughtException', function (e) {
    console.error('PushOrderBook App Uncaught Exception',e);
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

