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

    serialize(){
        return JSON.stringify({
            id: this.id,
            price: this.price,
            amount: this.amount,
            exchange: this.exchange,
            type: 'BUY'
        });
    }

    compare(order){
        return super.compare(order) && order instanceof BuyOrder;
    }
}
