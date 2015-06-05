var
    config = require('config'),
    BalanceTracker = require('../lib/Balance/BalanceTracker'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js');

var coinbase = new CoinbaseExchange();
var bitstamp = new BitstampExchange();
var exchanges = [coinbase, bitstamp];

BalanceTracker = new BalanceTracker(exchanges);
BalanceTracker.trackBalance(config.get('Exchange.Coinbase.balance_poll_interval'),coinbase);
BalanceTracker.trackBalance(config.get('Exchange.Bitstamp.balance_poll_interval'),bitstamp);
