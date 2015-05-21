/**
 * Created by parthpatel1001 on 5/17/15.
 */
var num = require('num');
var Order = function(orderIn){
    this.BUY_ORDER_TYPE = 'BUY';
    this.SELL_ORDER_TYPE = 'SELL';
    var self = this;


    this.isBuyOrder = function(){
      return orderIn.orderType == self.BUY_ORDER_TYPE;
    };

    this.isSellOrder = function(){
        return orderIn.orderType == self.SELL_ORDER_TYPE;
    };

    this.getPrice = function(){
        return num(orderIn.price);
    };

    this.getAmount = function(){
        return num(orderIn.amount);
    };

    this.getExchangeId = function() {
        return orderIn.exchangeId;
    };

    this.getOrderId = function(){
        return orderIn.orderId;
    };

    this.serialize = function(){
        return JSON.stringify(orderIn);
    };
};

module.exports = exports = Order;