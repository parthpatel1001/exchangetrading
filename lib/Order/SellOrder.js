import num from 'num';
import {OrderBase} from './OrderBase';
import {SELL_ORDER_TYPE} from "../Utilities/Helpers.js"

/**
 * @augments OrderBase
 */
export class SellOrder extends OrderBase {
    /**
     * @param {int} id
     * @param {float} price
     * @param {float} amount
     * @param {ExchangeBase} exchange
     */
    constructor(id, price, amount, exchange) {
        super(id, price, amount, exchange, SELL_ORDER_TYPE);
    }

    getCost(fee) {
        let feeDirection = num(1).sub(fee);
        return super.Magnitude.mul(feeDirection);
    };

    compare(order){
        return super.compare(order) && order instanceof SellOrder;
    }
}
