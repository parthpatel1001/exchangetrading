import simple from 'simple-mock';
import expect from "expect.js";
import {LosingStrategy} from "../../lib/Rebalance/Strategies/LosingStrategy";
import {OrderFactory} from '../../lib/Order/OrderFactory';
import {ExchangeFactory} from '../../lib/Exchange/ExchangeFactory';
import {Balance} from '../../lib/Balance/Balance';
import {BUY_ORDER_TYPE} from '../../lib/Utilities/Helpers';

describe('LosingStrategy', () => {
	afterEach(() => {
		simple.restore();
	});

	it('Should not execute trade if below the 16hr mark', () => {
		let ls = new LosingStrategy();
		let exSpy = simple.mock(LosingStrategy, 'execute');
		
		ls.process(BUY_ORDER_TYPE, null, null, 0);
		expect(exSpy.called).to.be(false);
	});

	it('Should execute trade with correct amounts on the 16hr mark', () => {
		let ls = new LosingStrategy();
		let exId = 0, usdAvail = 10, bcAvail = 0, timePassed = 16;
		let configUsed = ls.processConf[timePassed];
		let ofSpy = simple.mock(OrderFactory, 'createFromDeSerialized');
		
		let mockTick = {
			'bid': 
				{
					'price': 100, 
				 	'amount': 1
				}, 
			'Exchange': JSON.stringify(ExchangeFactory.createFromId(exId)) 
		};

		ls.process(BUY_ORDER_TYPE, mockTick, new Balance(exId,usdAvail,bcAvail), 16);

		let willingToPay = mockTick.bid.price * (1+configUsed.loss_ratio); // buy for 1.0015 above market price (the loss ratio at this time)
		let expected = [{
			'exchange': JSON.stringify(ExchangeFactory.createFromId(exId)),
			'price': willingToPay, 
			'amount': configUsed.trade_amount * usdAvail / willingToPay, // 0.5 * amount able to buy with the price you're willing to pay
			'type': BUY_ORDER_TYPE
		}];

		expect(ofSpy.called).to.be(true);
		expect(ofSpy.lastCall.args).to.eql(expected);
	})
});