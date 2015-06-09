import num from 'num';

let BUY_ORDER_TYPE = 'BUY',
    SELL_ORDER_TYPE = 'SELL';

export class Order {
    constructor(orderIn) {
        this.curOrder = orderIn;
    }

    isBuyOrder() {
      return this.curOrder.orderType == BUY_ORDER_TYPE;
    };

    isSellOrder() {
        return this.curOrder.orderType == SELL_ORDER_TYPE;
    };

    getPrice() {
        return num(this.curOrder.price);
    };

    getAmount() {
        return num(this.curOrder.amount);
    };

    getExchangeId() {
        return this.curOrder.exchangeId;
    };

    getOrderId() {
        return this.curOrder.orderId;
    };

    /**
     * Get the magnitude (price*amount) of the order
     * @returns {num}
     */
    getMagnitude() {
        return num(this.curOrder.price).mul(this.curOrder.amount);
    };

    /**
     * Get the cost of this order provided the exchange
     * If it is a buy order the order "costs" the cash cost of the order *plus* the fee
     * If it is a sell order the order "costs" the cash proceed of the order *minus* the fee
     * @param fee num object
     * @returns {num}
     */
    getCost(fee) {
        let feeDirection;

        if(this.isBuyOrder()) {
            feeDirection = fee.add(1);
        } else if(this.isSellOrder()) {
            feeDirection = num(1).sub(fee);
        } else {
            throw new Error('Bad order type: '+this.serialize());
        }

        return this.getMagnitude().mul(feeDirection);
    };

    serialize() {
        return JSON.stringify(this.curOrder);
    };
}
