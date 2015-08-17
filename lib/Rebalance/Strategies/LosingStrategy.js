import config from 'config';
import {BaseStrategy} from '../BaseStrategy';
import {OrderFactory} from '../../Order/OrderFactory';
import {BUY_ORDER_TYPE, SELL_ORDER_TYPE} from '../../Utilities/Helpers';


export class LosingStrategy extends BaseStrategy {

	constructor() {
		super();

		this.thresholds = config.get('Rebalance.LosingStrategy.Thresholds');
		this.start = config.get('Rebalance.LosingStrategy.Start');
		this.timeout = config.get('Rebalance.LosingStrategy.Timeout');
	}
	
    execute(exchange, direction, tradeAmount, tradePrice) {
    	OrderFactory.createFromDeSerialized({'exchange': exchange, 'amount': tradeAmount, 'price': tradePrice, 'type': direction});
	}

	process(direction, tick, availableBalance, timePassed) {
		//start losing trade at 16hr mark
		if(timePassed >= this.start && timePassed < this.timeout) {
			let opts = this.thresholds[timePassed];
			let tradePrice, tradeAmount;

			if(direction == BUY_ORDER_TYPE) {
				tradePrice = (1+opts.loss_ratio) * tick.bid.price; //buy for loss ratio % above highest bidder
				tradeAmount = opts.trade_amount * availableBalance.USDAvailable / tradePrice; // % of money willing to spend to get amount of bitcoints at that trade price
			}
			else if(direction == SELL_ORDER_TYPE){
				tradePrice = (1-opts.loss_ratio) * tick.ask.price; 
				tradeAmount = opts.trade_amount * availableBalance.BTCAvailable();
			}
			else {
				throw new Error('Invalid direction of trade on rebalancer');
			}
			
			this.execute(tick.Exchange, direction, tradeAmount, tradePrice);
		}
    }
}