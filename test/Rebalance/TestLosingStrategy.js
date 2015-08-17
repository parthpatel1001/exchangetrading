import simple from 'simple-mock';
import assert from "assert";
import {LosingStrategy} from "../../lib/Rebalance/Strategies/LosingStrategy"

describe('LosingStrategy', () => {
	it('Should trade correctly based on the amount of time passed', () => {
		let ls = new LosingStrategy();

		let exSpy = simple.mock(LosingStrategy, 'execute');

		ls.process('BUY', null, null, 0);

		assert(exSpy.called === false);
	});
});