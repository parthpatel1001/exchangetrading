/**
 * Created by parthpatel1001 on 5/24/15.
 */
var num = require('num');

var Balance = function(balanceIn){
    var balance = balanceIn;
    this.getUSDAvailable = function(){ return num(balance.usd_avail); };
    this.getBTCAvailable = function(){ return num(balance.btc_avail); };
    this.setUSDAvailable = function(amount){ balance.usd_avail = amount.toString();};
    this.setBTCAvailable = function(amount){ balance.btc_avail = amount.toString();};
    this.getExchangeId = function(){ return balance.exchangeId; };
    this.serialize = function(){ return JSON.stringify(balance); };
};

module.exports = exports = Balance;