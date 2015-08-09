import {LosingStrategy} from './Strategies';

export class StrategyManager {
	constructor(options) {
	    this._strategies = [];
	    this._distributeActions = [];
	    this._started = new Date().getHours();
	}

	_distribute() {
		//process actions
	}

	_doneDistributing() {
	    //execute actions, might not need this in order to not add a delay between process and acecute, execute is called within process. Can do other housework here

	    _clearDistributing(tick);

	};

	_clearDistributing() {
		this._distributeActions = [];
	}

	addStrategies(strats) {
		//add strategies, strats can be single or array
	}
}