import {BaseStrategy} from '../BaseStrategy';

export class LosingStrategy extends BaseStrategy {

	constructor() {
		super();

		this.processConf = {
			16: {'trade_amount': .5, 'loss_ratio': 0.0015},
			17: {'trade_amount': .5, 'loss_ratio': 0.0023},
			18: {'trade_amount': .5, 'loss_ratio': 0.0030},
			19: {'trade_amount': .5, 'loss_ratio': 0.0038},
			20: {'trade_amount': .5, 'loss_ratio': 0.0045},
			21: {'trade_amount': .5, 'loss_ratio': 0.0053},
			22: {'trade_amount': .5, 'loss_ratio': 0.0060},
			23: {'trade_amount': .5, 'loss_ratio': 0.0068},
			24: {'trade_amount': .5, 'loss_ratio': 0.0075},
			25: {'trade_amount': 1, 'loss_ratio': 0} //change this later
		}
	}
	
    execute(direction, tradeAmount, tradePrice) {
    	console.log('losing execute with ' + amount);
	}

	process(direction, tick, availableBalance, timePassed) {
		//start losing trade at 16hr mark
		if(timePassed > 15 && timePassed < 26) {
			let opts = processConf[timePassed];
			let tradePrice, tradeAmount;

			if(direction == 'BUY') {
				tradePrice = (1+opts.loss_ratio) * tick.bid.price; //buy for loss ratio % above highest bidder
				tradeAmount = opts.trade_amount * availableBalance.USDAvailable / tradePrice; // % of money willing to spend to get amount of bitcoints at that trade price
			}
			else {
				tradePrice = (1-opts.loss_ratio) * tick.ask.price; 
				tradeAmount = opts.trade_amount * availableBalance.BTCAvailable();
			}
			

			this.execute(direction, tradePrice, tradeAmount);
		}
    }
}