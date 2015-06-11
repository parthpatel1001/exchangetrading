var
    config = require('config'),
    BalanceTracker = require('../lib/Balance/BalanceTracker'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js');

var coinbase = new CoinbaseExchange(config.get('Exchange.Coinbase.id'));
var bitstamp = new BitstampExchange(config.get('Exchange.Bitstamp.id'));

BalanceTracker = new BalanceTracker();
BalanceTracker.trackBalance(config.get('Exchange.Coinbase.balance_poll_interval'),coinbase);
BalanceTracker.trackBalance(config.get('Exchange.Bitstamp.balance_poll_interval'),bitstamp);

