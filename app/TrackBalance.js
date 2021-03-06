import 'babel/polyfill';
import config from 'config';
import async from 'async';
import pm2 from 'pm2';
import {BalanceTracker} from './Balance/BalanceTracker';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';
import {Notification, NotificationLevels} from './Notification';

Notification.eventTriggered("Application Start Up", { AppName: "TrackBalance" }, "", NotificationLevels.HIGH);

let coinbase = new CoinbaseExchange(),
    bitstamp = new BitstampExchange();

let balanceTracker = new BalanceTracker();
balanceTracker.trackBalance(config.get('Exchange.Coinbase.balance_poll_interval'),coinbase);
balanceTracker.trackBalance(config.get('Exchange.Bitstamp.balance_poll_interval'),bitstamp);

process.on('uncaughtException',function(e){
    console.error('Uncaught Exception',e);
    let notifier = new Notification(),
        opts = config.get('Notification.Slack.error_config'),
        error = e.toString() || JSON.stringify(e);

    async.parallel([
        () => {
            pm2.connect(function(err){
                pm2.restart('TrackBalance'); // TODO make this a config, tricky because pm2 wants its own app declaration file
                notifier.message("Restarted TrackBalance",opts);
                console.log('Restarted TrackBalance');
            });
        },
        () => { notifier.message("Exception thrown in *TrackBalance* ",opts); },
        () => { notifier.message("Error: " + error,opts);},
        () => { notifier.message("Trace: " + e.stack,opts);}
    ]);
});
