/**
 * Created by parthpatel1001 on 5/17/15.
 */
var
    Redis = require("redis"),
    Order = require('../lib/Order/Order.js'),
    OrderSubscriber = require('../lib/Order/OrderSubscriber.js'),
    OrderProcessor = require('../lib/Order/OrderProcessor.js'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js'),
    ExchangeManager   = require('../lib/Exchange/ExchangeManager.js'),
    BalanceTracker = require('../lib/Balance/BalanceTracker.js'),
    Balance = require('../lib/Balance/Balance.js'),
    config = require('config'),
    Slack = require('../lib/Slack/SlackMessenger.js'),
    Notification = require('../lib/Notification.js'),  // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER;
    async = require('async'),
    pm2 = require('pm2');

var notifier = new Notification(new Slack());
var opts = config.get('Notification.Slack.error_config');

var coinbase = new CoinbaseExchange(config.get('Exchange.Coinbase.id')),
    bitstamp = new BitstampExchange(config.get('Exchange.Bitstamp.id'));

var exchanges = [coinbase, bitstamp];

ExchangeManager = new ExchangeManager();
for(var i = 0, len = exchanges.length; i < len; i++) {
    ExchangeManager.addExchange(exchanges[i]);
}

BalanceTracker = new BalanceTracker(Redis,Balance);

OrderProcessor = new OrderProcessor(ExchangeManager,BalanceTracker,notifier);
OrderSubscriber = new OrderSubscriber(Redis,Order);

OrderSubscriber.subscribeToLinkedOrderStream(config.get('EventChannels.LINKED_ORDER_STREAM'),OrderProcessor.processLinkedOrder);



process.on('uncaughtException',function(e){
    console.error('Uncaught Exception',e);

    var error = e.toString() || JSON.stringify(e);

    async.parallel([
        function(){
            pm2.connect(function(err){
                pm2.stop('ProcessOrder'); // TODO make this a config, tricky because pm2 wants its own app declaration file
                notifier.message("Stopped ProcessOrder",opts);
                console.log('Stopped ProcessOrder');
            });
        },
        function(){ notifier.message("Exception thrown in *ProcessOrder* ",opts); },
        function(){ notifier.message(error,opts);}
    ]);
});