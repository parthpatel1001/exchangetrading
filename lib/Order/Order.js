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

    /**
     * Get the magnitude (price*amount) of the order
     * @returns {num}
     */
    this.getMagnitude = function(){
        return num(orderIn.price).mul(orderIn.amount);
    };

    /**
     * Get the cost of this order provided the exchange
     * If it is a buy order the order "costs" the cash cost of the order *plus* the fee
     * If it is a sell order the order "costs" the cash proceed of the order *minus* the fee
     * @param fee num object
     * @returns {num}
     */
    this.getCost = function(fee){
        var feeDirection;

        if(this.isBuyOrder()) {
            feeDirection = fee.add(1);
        } else if(this.isSellOrder()) {
            feeDirection = num(1).sub(fee);
        } else {
            throw new Error('Bad order type: '+this.serialize());
        }

        return this.getMagnitude().mul(feeDirection);
    };
    this.serialize = function(){
        return JSON.stringify(orderIn);
    };
};

module.exports = exports = Order;