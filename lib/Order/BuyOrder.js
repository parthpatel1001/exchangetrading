import num from 'num';
import {OrderBase} from './OrderBase.js';
/**
 * @augments OrderBase
 */
export class BuyOrder extends OrderBase {
    constructor(id, price, amount, exchange) {
        super(id, price, amount, exchange);
    }

    getCost(fee) {
        let feeDirection = fee.add(1);
        return super.Magnitude.mul(feeDirection);
    };
}
