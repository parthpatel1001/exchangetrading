export class BaseStrategy {
	process(direction, tick, availableBalance, timePassed) {
    	throw new Error('Must implement method process');
    }

    execute(direction, tradeAmount, tradePrice) { 
    	throw new Error('Must implement method execute');
	}
}