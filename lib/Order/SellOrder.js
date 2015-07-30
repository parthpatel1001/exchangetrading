import num from 'num';
import {OrderBase} from './OrderBase';
/**
 * @augments OrderBase
 */
export class SellOrder extends OrderBase {
    /**
     *
     * @param {int} id
     * @param {float} price
     * @param {float} amount
     * @param {int} exchange
     */
    constructor(id, price, amount, exchange) {
        super(id, price, amount, exchange);
    }

    getCost(fee) {
        let feeDirection = num(1).sub(fee);
        return this.Magnitude.mul(feeDirection);
    };

    serialize(){
        return JSON.stringify({
            id: this.id,
            price: this.price,
            amount: this.amount,
            exchange: this.exchange,
            type: 'SELL'
        });
    }
    compare(order){
        return super.compare(order) && order instanceof SellOrder;
    }
}
