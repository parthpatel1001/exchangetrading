import {OrderBase} from './OrderBase';

export class SellOrder extends OrderBase {
    constructor(id, price, amount, exchange) {
        super(id, price, amount, exchange);
    }

    getCost(fee) {
        let feeDirection = num(1).sub(fee);
        return this.Magnitude.mul(feeDirection);
    };
}
