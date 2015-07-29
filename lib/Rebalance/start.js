/*
 TODO Figure out where the base strategy class goes/move to Rebalance/strategies
 TODO change class declaration to es6
 TODO unit tests
 TODO fill out blank methods
 */


/**
 *
 * @constructor
 */
var BaseStrategy = function(){
    // each strategy is given the current tick
    // the avail balance
    // and the timepassed since the start of the allocator cycle
    // it should call then passing it a BaseStrategyAction instance
    this.process = function(tick,availableBalance,timePassed,then) {
        throw new Error('Must implement abstract method processTick');
    }
};
var BaseStrategyAction = function(){
    this.execute = function(){
        throw new Error('Must implement abstract method execute');
    };
};
// LosingTradeStratgey extends BaseStrategy
var LosingTradeStratgey = function(){
    var MAX_LOSS_THRESHOLD = .005;

};
// LosingTradeAction extends BaseStrategyAction
var LosingTradeAction = function(){
    this.action = function(){};
};


// WinningTradeStrategy extends BaseStrategy
var WinningTradeStrategy = function(){

};

// WinningTradeAction extends BaseStrategyAction
var WinningTradeAction = function(){
    this.action = function(){};
};

/**
 * holds bucket of strategies
 * delegates events to added strategies in priority order
 * maintains the "clock"
 */
var Allocator = function(bm,asy){
    var balanceManager = bm;
    var async = asy;
    var _strategies = [];
    var _started;

    /**
     * lock states
     */
    var LOCKS = {
        WAITING: 0
        DISTRIBUTING: 1,
        INVALIDATE: -1,
    };

    var _distributingLock = LOCKS.WAITING;
    var _distributeActions = [];

    var _doneDistributing = function(tick){
        // execute all the queued actions
        // might need to use async here(?)
        for(var i in _distributeActions) {
            _distributeActions[i].execute();
        }
        _clearDistributing(tick);

    };
    var _clearDistributing = function(tick) {
        _distributeActions = [];
        _distributingLock = LOCKS.WAITING;
    };

    // recurse through all the strategies
    // push the returned action from the strategy to the stack
    // handle locks changing
    var _distribute = function(i,tick)
    {
        bm.getAvailableBalance(function(bal){
            _strategies[i].process(
                // pass in the data
                tick,bal,new Date().getTime() - _started,

                // give the strategy a handler to
                // handle the action passed back by it
                function(action){

                    // check the distributing lock,
                    //  if invalid, clear and
                    // stop processing this *current* tick
                    if(_distributingLock == LOCKS.INVALIDATE) {
                        _clearDistributing();
                        return;
                    }

                    // push the current action onto the stack
                    _distributeActions.push(action);

                    // move onto the next strategy if it is there
                    // otherwise finish
                    if(i < _strategies.length - 1 )	 {
                        _distribute(i+1,tick);
                    } else {
                        _doneDistributing(tick);
                    }
                }
            );
        });

    };

    // handle a new tick
    // new ticks always take priority and invalidate processing
    //  still left for older ticks
    this.onOrderBookTick = function(tick){
        if(_distributingLock === LOCKS.DISTRIBUTING) {
            // this means the time it took to run _distribute()
            // was > the time it took to revieve a new tick
            // set the lock to invalidate
            _distributingLock = LOCKS.INVALIDATE;
            // the thing with returning here is
            // we skip processing the current tick
            // this is safer then sending orders on an invalid tick
            // but sucks because what could happen is:
            // 5 fast ticks -> no ticks for 10 minutes
            // in those 10 minutes, the top of the book could have been used to allocate on
            // realistically, this should protect from bursts
            // and the next tick should "reboot" the allocator
            return;
        }
        _distributingLock = LOCKS.DISTRIBUTING;
        _distribute(0,tick);
    };
    // strategies should be added in priority order
    // they will be checked in this order
    this.addStrategy = function(strat){
        _strategies.push(strat);
    };

    // once started, do not allow addStrategy to be called
    // run state validations here once instead of on every tick
    this.start = function(){
        this.addStratgey = function(){ throw new Error('Cannot add a stratgey once Allocator is started'); };
        // state validation
        if(!_started) { throw new Error('Start time must be set to a unix timestamp'); }
        if(_strategies.length < 1){ throw new Error('must have at least one strategy in Allocator to start'); }


    };
    // this.stop()? this.restart()? this.refresh()?

};

/**
 * Inside whatever app/Allocator process that will instantiate/run
 */
var async = require('async');
var ordBkSub = new OrderBookSubscriber(), // subscribe to the orderbook
    alctr    = new Allocator(new BalanceManager(),async);

alctr.addStrategy(new WinningTradeStrategy());
// alctr.addStrategy(new SellCoveredOptionStrategy());
alctr.addStrategy(new LosingTradeStrategy());

ordBkSub.subscribe(alctr.onOrderBookTick);

alctr.start();

// setInterval() every config.get('REBALANCE.target_time_to_reallocate') hours restart