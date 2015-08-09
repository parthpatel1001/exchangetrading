import config from 'config';

let MAX_LOSS_THRESHOLD = config.get('TradeThresholds.MAX_LOSS_THRESHOLD');
let MIN_LOSS_THRESHOLD = config.get('TradeThresholds.MIN_LOSS_THRESHOLD');

export class BaseStrategy {
	getMaxLossThreshold() {
		return MAX_LOSS_THRESHOLD;
	}

	getMinLossThreshold() {
		return MIN_LOSS_THRESHOLD;
	}

	process(tick,availableBalance,timePassed,then) {
    	throw new Error('Must implement method process');
    }

    execute(amount) { 
    	throw new Error('Must implement method execute');
	}
}