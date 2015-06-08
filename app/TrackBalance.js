import config from 'config';
import {BalanceTracker} from './Balance/BalanceTracker';
import {CoinbaseExchange} from './Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from './Exchange/Bitstamp/BitstampExchange';

let coinbase = new CoinbaseExchange(),
    bitstamp = new BitstampExchange();
let exchanges = [coinbase, bitstamp];

let balanceTracker = new BalanceTracker(exchanges);
balanceTracker.trackBalance(config.get('Exchange.Coinbase.balance_poll_interval'),coinbase);
balanceTracker.trackBalance(config.get('Exchange.Bitstamp.balance_poll_interval'),bitstamp);
