/**
 * Created by parthpatel1001 on 5/22/15.
 */
var StatsD = require('node-statsd'),
    statsDClient = new StatsD();
var config = require('config');

var Track = function()
{
    var exchangeNames = [];
    var exchangeConfig = config.get('Exchange');
    for(var i in exchangeConfig) {
        var exchange = exchangeConfig[i];
        exchangeNames[exchange.id] = i;
    }


    this.getExchangeName = function(exchangeId) {
        return exchangeNames[exchangeId];
    };

    this.gauge = function(key,value){
        statsDClient.gauge(key,value);
    };
};

module.exports = exports = new Track();