/**
 * Created by parthpatel1001 on 5/24/15.
 */
var num = require('num');

var Balance = function(balanceIn){
    this.getUSDAvailable = function(){ return num(balanceIn.usd_avail); };
    this.getBTCAvailable = function(){ return num(balanceIn.btc_avail); };
    this.getExchangeId = function(){return balanceIn.exchangeId; };
    this.serialize = function(){
        return JSON.stringify(balanceIn);
    };
};

module.exports = exports = Balance;