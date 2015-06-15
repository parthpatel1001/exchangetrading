import config from 'config';
import async from 'async';
import pm2 from 'pm2';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';
import {OrderProcessor} from './Order/OrderProcessor';
import {OrderSubscriber} from './Order/OrderSubscriber';
import {Notification} from'./Notification'; // TODO MOVE THIS TO A NAMESPACE/DOMAIN FOLDER
import {ExchangeManager} from './Exchange/ExchangeManager';

let coinbase = new CoinbaseExchange(),
    bitstamp = new BitstampExchange();

let exchanges = [coinbase, bitstamp];

let exchangeManager = new ExchangeManager();
for(let i = 0, len = exchanges.length; i < len; i++) {
    exchangeManager.addExchange(exchanges[i]);
}

let orderProcessor = new OrderProcessor(exchangeManager),
    orderSubscriber = new OrderSubscriber();

orderSubscriber.subscribeToLinkedOrderStream(config.get('EventChannels.LINKED_ORDER_STREAM'),orderProcessor.processLinkedOrder);

process.on('uncaughtException',(e) => {
    console.error('Uncaught Exception',e);

    let notifier = new Notification(),
        opts = config.get('Notification.Slack.error_config');
    let error = e.toString() || JSON.stringify(e);

    async.parallel([
        () => {
            pm2.connect(function(err){
                pm2.stop('ProcessOrder'); // TODO make this a config, tricky because pm2 wants its own app declaration file
                notifier.message("Stopped ProcessOrder",opts);
                console.log('Stopped ProcessOrder');
            });
        },
        () => { notifier.message("Exception thrown in *ProcessOrder* ",opts); },
        () => { notifier.message(error,opts);}
    ]);
});
