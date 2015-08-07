import {BuyOrder} from "./BuyOrder.js";
import {SellOrder} from "./SellOrder.js";
import {ExchangeFactory} from "../Exchange/ExchangeFactory.js"
import {BUY_ORDER_TYPE, SELL_ORDER_TYPE} from "../Utilities/Helpers.js"

export class OrderFactory {
    /**
     *
     * @param ser
     * @returns {OrderBase}
     */
    static createFromDeSerialized(ser) {
        if (!ser /*|| !ser.id*/ || !ser.exchange || !ser.amount || !ser.price || !ser.type) {
            throw new TypeError('Invalid serialized order ' + JSON.stringify(ser));
        }

        if (ser.type === BUY_ORDER_TYPE) {
            return OrderFactory.createBuyOrder(ser);
        }

        if (ser.type === SELL_ORDER_TYPE) {
            return OrderFactory.createSellOrder(ser);
        }

        throw new TypeError('Unknown Order Type ' + ser.type);
    }

    /**
     * Should *always* return a buy order, regardless of input data
     * Even if the provided input was {type: SELL}
     * strictness should be enforced on the caller of this function
     * @param ser
     * @returns {BuyOrder}
     */
    static createBuyOrder(ser) {
        let parsed = JSON.parse(ser.exchange);
        let exch = ExchangeFactory.createFromId(parsed.exchangeId);
        return new BuyOrder(ser.id,ser.price,ser.amount,exch);
    }

    static createBuyOrderParsed(id, price, amt, exch) {
        return new BuyOrder(id, price, amt, exch);
    }

    /**
     * Should *always* return a buy order, regardless of input data
     * Even if the provided input was {type: BUY}
     * strictness should be enforced on the caller of this function
     * @param ser
     * @returns {SellOrder}
     */
    static createSellOrder(ser) {
        let parsed = JSON.parse(ser.exchange);
        let exch = ExchangeFactory.createFromId(parsed.exchangeId);
        return new SellOrder(ser.id,ser.price,ser.amount,exch);
    }

    static createSellOrderParsed(id, price, amt, exch) {
        return new SellOrder(id, price, amt, exch);
    }
}
