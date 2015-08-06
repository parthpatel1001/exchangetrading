import config from 'config'

let MAX_LOSS_THRESHOLD = config.get('TradeThresholds.MAX_LOSS_THRESHOLD');

export class BaseStrategy {
	getLossThreshold() {
		return MAX_LOSS_THRESHOLD;
	}

	process(tick,availableBalance,timePassed,then) {
    	throw new Error('Must implement method process');
    }

    execute() { 
    	throw new Error('Must implement method execute');
	}
}