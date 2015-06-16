var
    config = require('config'),
    BalanceTracker = require('../lib/Balance/BalanceTracker'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js'),
    Notification = require('../lib/Notification.js'), // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER
    async = require('async'),
    pm2 = require('pm2');

var coinbase = new CoinbaseExchange();
var bitstamp = new BitstampExchange();
var notifier = new Notification();
var opts = config.get('Notification.Slack.error_config');

BalanceTracker = new BalanceTracker();
BalanceTracker.trackBalance(config.get('Exchange.Coinbase.balance_poll_interval'),coinbase);
BalanceTracker.trackBalance(config.get('Exchange.Bitstamp.balance_poll_interval'),bitstamp);


process.on('uncaughtException',function(e){
    console.error('Uncaught Exception',e);

    var error = e.toString() || JSON.stringify(e);

    async.parallel([
        function(){
            pm2.connect(function(err){
                pm2.restart('TrackBalance'); // TODO make this a config, tricky because pm2 wants its own app declaration file
                notifier.message("Restarted TrackBalance",opts);
                console.log('Restarted TrackBalance');
            });
        },
        function(){ notifier.message("Exception thrown in *TrackBalance* ",opts); },
        function(){ notifier.message(error,opts);}
    ]);
});