import {BaseStrategy} from '../BaseStrategy';

export class LosingStrategy extends BaseStrategy {
    execute(amount) { 
    	console.log('losing execute with ' + amount);
	}

	process(tick,availableBalance,timePassed,then) {
		console.log('losing process');

		//start losing trade at 16hr mark
		if(timePassed < 16) {
			return -1;
		}
		else if(timePassed < 25) {
			this.execute(0.5);
		}
		else {
			this.execute(1);
		}

		//callback
		//then();
    }
}