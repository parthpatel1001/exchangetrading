/**
 * Created by parthpatel1001 on 5/12/15.
 */

var ExchangeManager = function() {
    var exchanges = [];

    this.addExchange = function(ex) {
        exchanges[ex.getExchangeId()] = ex;
        return this;
    };

    this.getExchange = function(exNum) {
        return exchanges[exNum];
    };
};

module.exports = exports = ExchangeManager;