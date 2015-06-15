import config from 'config';
import {BalanceTracker} from './Balance/BalanceTracker';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';
import {OrderProcessor} from './Order/OrderProcessor';
import {OrderSubscriber} from './Order/OrderSubscriber';
var Notification = require('../lib/Notification.js'), // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER
    async = require('async'),
    pm2 = require('pm2');

var ExchangeManager   = require('../es5/Exchange/ExchangeManager.js');

let coinbase = new CoinbaseExchange(),
    bitstamp = new BitstampExchange();

let exchanges = [coinbase, bitstamp];

let exchangeManager = new ExchangeManager();
for(let i = 0, len = exchanges.length; i < len; i++) {
    exchangeManager.addExchange(exchanges[i]);
}

let balanceTracker = new BalanceTracker(exchanges);

let orderProcessor = new OrderProcessor(exchangeManager,balanceTracker),
    orderSubscriber = new OrderSubscriber();

orderSubscriber.subscribeToLinkedOrderStream(config.get('EventChannels.LINKED_ORDER_STREAM'),orderProcessor.processLinkedOrder);

process.on('uncaughtException',function(e){
    console.error('Uncaught Exception',e);

    let notifier = new Notification(),
        opts = config.get('Notification.Slack.error_config');
    let error = e.toString() || JSON.stringify(e);

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