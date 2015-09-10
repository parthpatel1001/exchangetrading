import num from 'num';
import simple from 'simple-mock';
import assert from "assert";
import {OrderBase} from '../../lib/Order/OrderBase';
import {BuyOrder} from '../../lib/Order/BuyOrder';
import {SellOrder} from '../../lib/Order/SellOrder';
import {BitstampExchange} from '../../lib/Exchange/Wrappers/BitstampExchange';

describe('Order', function(){
	it('Should give correct subtotal of order before fee',function(){
		let price = 3,
		    amount = 5,
            expectedTotal = price * amount,
            order = new BuyOrder(null, price, amount, null);

        assert(order.Magnitude.cmp(num(expectedTotal)) === 0);
	});

	it('Should give correct total after fee if buy order',function(){
		let price = 3,
            amount = 5,
            exchange = new BitstampExchange(),
            fee = exchange.Fee,
            expectedTotal = price * amount * (1 + parseFloat(fee)),
            order = new BuyOrder(null, price, amount, exchange);

		assert(order.getCost(fee).cmp(num(expectedTotal)) === 0);
	});

	it('Should give correct total after fee if sell order',function(){
		let price = 3,
            amount = 5,
            exchange = new BitstampExchange(),
            fee = exchange.Fee,
            expectedTotal = price * amount * (1 - parseFloat(fee)),
            order = new SellOrder(null, price, amount, null);

		assert(order.getCost(fee).cmp(num(expectedTotal)) === 0);
	});
});
