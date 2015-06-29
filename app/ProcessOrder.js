var OrderSubscriber = require('../lib/Order/OrderSubscriber.js'),
    OrderProcessor = require('../lib/Order/OrderProcessor.js'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js'),
    ExchangeManager   = require('../lib/Exchange/ExchangeManager.js'),
    config = require('config'),
    Notification = require('../lib/Notification.js'), // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER
    async = require('async'),
    pm2 = require('pm2'),
    Redis = require("redis");

var coinbase = new CoinbaseExchange(),
    bitstamp = new BitstampExchange();

var exchanges = [coinbase, bitstamp];

ExchangeManager = new ExchangeManager();
for(var i = 0, len = exchanges.length; i < len; i++) {
    ExchangeManager.addExchange(exchanges[i]);
}

var redisClient = Redis.createClient();

OrderProcessor = new OrderProcessor(ExchangeManager);
OrderSubscriber = new OrderSubscriber(redisClient);

OrderSubscriber.subscribeToLinkedOrderStream(OrderProcessor.processLinkedOrder);

process.on('uncaughtException',function(e){
    console.error('Uncaught Exception',e);

    var notifier = new Notification(),
        opts = config.get('Notification.Slack.error_config');
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
        function(){ notifier.message("Error: " + error,opts);},
        function(){ notifier.message("Trace: " + e.stack,opts);}
    ]);
});