import {BuyOrder} from "./BuyOrder.js";
import {SellOrder} from "./SellOrder.js";
import {BUY_ORDER_TYPE, SELL_ORDER_TYPE} from "../Utilities/Helpers.js"

export class OrderFactory {
    /**
     *
     * @param ser
     * @returns {OrderBase}
     */
    static createFromDeSerialized(ser) {
        if(!ser || !ser.id || !ser.exchange || !ser.amount || !ser.price || !ser.type) {
            throw new TypeError('Invalid serialized order '+JSON.stringify(ser));
        }

        if(ser.type === BUY_ORDER_TYPE) {
            return new BuyOrder(ser.id,ser.price,ser.amount,ser.exchange);
        }

        if(ser.type === SELL_ORDER_TYPE) {
            return new SellOrder(ser.id,ser.price,ser.amount,ser.exchange);
        }

        throw new TypeError('Unknown Order Type '+ser.type);
    }

    /**
     * Should *always* return a buy order, regardless of input data
     * Even if the provided input was {type: SELL}
     * strictness should be enforced on the caller of this function
     * @param ser
     * @returns {BuyOrder}
     */
    static createBuyOrder(ser) {
        return new BuyOrder(ser.id,ser.price,ser.amount,ser.exchange);
    }

    /**
     * Should *always* return a buy order, regardless of input data
     * Even if the provided input was {type: BUY}
     * strictness should be enforced on the caller of this function
     * @param ser
     * @returns {SellOrder}
     */
    static createSellOrder(ser) {
        return new SellOrder(ser.id,ser.price,ser.amount,ser.exchange);
    }
}