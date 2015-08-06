import num from 'num';
import {OrderBase} from './OrderBase.js';
import {BUY_ORDER_TYPE} from "../Utilities/Helpers.js"

/**
 * @augments OrderBase
 */
export class BuyOrder extends OrderBase {
    constructor(id, price, amount, exchange) {
        super(id, price, amount, exchange, BUY_ORDER_TYPE);
    }

    getCost(fee) {
        let feeDirection = fee.add(1);
        return super.Magnitude.mul(feeDirection);
    };

    compare(order){
        return super.compare(order) && order instanceof BuyOrder;
    }
}
