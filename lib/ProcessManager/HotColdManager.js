var child = require('child_process');
var ARGS = process.argv;

/**
 * if you give an int as the index, will return the arg at that index
 * if you give a string, will return the arg right after --flag
 * if required is true, and the above returns falsey, will throw an error
 * @param {string|int} argument flag to look up
 * @param {boolean} required bool
 * // TODO move to helpers
 */
var getArgument = function(flag,required){
	var val;
	// if we give an int as a flag get the value at that index
	// add 2 to the int, because node throws node & filename as the first two args
	// this lets you do node test.js myArg
	// getArgument(0) == myArg
	if(!isNaN(flag)) {
		
		val =  ARGS[flag + 2];
		// don't give back a --flag if provided an index
		if(val && val.indexOf('--') !== -1) {
			throw new Error('Argument at index '+flag+' is a flag '+val);
		}
		if(required & val===undefined){ 
			throw new Error('Argument at index '+flag+' is required');
		}
		
		return val;
	}

	// find the flag and give back the next value if its there
	var i = ARGS.indexOf('--'+flag);
	val = i == -1 ? null : ARGS[i+1];
	if(required & !val){
		throw new Error('Argument '+flag+'is required');
	}
	return val;
};



	// path to file that sends a feed to process.send
var FEED_LOCATION = getArgument('feed') || 'test_feed.js',
	// how often to swap hot & cold in ms
	SWAP_EVERY    = getArgument(0,true),
	// how often to refresh cold as a percentage of the time we swap hot & cold
	// if SWAP_EVERY is 60,000ms and the provided threshold is .1
	// the cold connection will be refreshed every 60000 * (1 - .1) = 54,000ms
	// this should very carefully be picked based on how long it takes a feed to become valid
	// picking too high of a threshold will result in hot being swapped w/ a not ready cold feed
	// picking too low of a threshold will result in cold not being reloaded in time for the hot/cold swap
	// ideally, SWAP_EVERY is some safe length less than how often a feed errors
	// and REFRESH_THRESHOLD is half of SWAP_EVERY
	// this would result in a hot/cold swap happening *before* a feed error on average
	// and a fresh cold twice in that interval
	REFRESH_THRESHOLD = getArgument('refresh') || .5,
	// if true, any objects sent out of this process will have a _hotcold : {} info object attached to them
	// this will contain pids & other debug info
	// also, much more detailed information will be sent to stdout
	// *note* this means if this is called *not* through .fork()
	// stdout will recieve more then just the event from a feed
	// if called as a .fork(), feed events go to process.send
	// 	 and debug info goes to stdout
	DEBUG = getArgument('debug') || false;


// hot is the current live feed 
// cold is being listened to, but not sending a message out of this process
var hot, cold;

/**
 * {subscribeAsChild|subscribeAsParent}
 * set in main()
 */
var subscribe;

/**
 * If debug mode, send a lot more information to stdout
 */
var log = DEBUG ? console.log : function(){};
var log_err = DEBUG ? console.error : function(){};

/*
 * node HotColdManager.js SWAP_EVERY 
 	SWAP_EVERY {required, int} how often in ms to swap hot & cold
 	--feed {optional, location of script feed} 
 	--refresh {optional, threshold for how often to refresh cold}
 	--debug {optional, boolean}
 */
var main = function(){
	// load which function to handle sending the feed data ahead of time
	// instead of checking the bit at runtime for each tick
	// http://stackoverflow.com/questions/30763112/how-to-tell-if-child-node-js-process-was-from-fork-or-not
	subscribe = process.send === undefined ? subscribeAsParent : subscribeAsChild;
	log('MAIN_START\t',
		JSON.stringify(
		{
			mode: process.send === undefined ? 'Parent' : 'Child',
			debug: DEBUG,
			feed: FEED_LOCATION,
			swap: SWAP_EVERY,
			refresh: REFRESH_THRESHOLD
		})
	);
	// load hot & cold
	getHotFeed(FEED_LOCATION);
	getColdFeed(FEED_LOCATION);
	// set the interval to swap
	setInterval(function(){
		swapHotAndCold(FEED_LOCATION);
	},SWAP_EVERY);

	// set a interval to refresh the cold
	setInterval(function(){
		refreshCold(FEED_LOCATION);
	},SWAP_EVERY*( 1 - REFRESH_THRESHOLD));
};



/**
 * get the pids of hot & cold
 */
var getCurrentFeedPids = function(){
	return {
		hot: hot && hot.pid ? hot.pid : null,
		cold: cold && cold.pid? cold.pid: null
	};
};


/**
 * @param {*} msg data sent from a forked child process via process.send
 * subscriber function, check if we are hot feed
 * if we are, push the message out to process.send 
 * if debug, load a different function ahead of time
 * if this file is being called from .fork(), and DEBUG 
 * the debug info will get passed up to the parent process stdout
 * these messages *will not* be part of process.on('message')
 */
var subscribeAsChild = DEBUG ? function(msg){
	if(msg && this.pid == hot.pid) {
		msg.__hotcold = getCurrentFeedPids();
		msg.__hotcold.__sent_with = hot.pid;
		process.send(msg);
	} else {
		// still send a null, false etc msg up to the parent
		// we shouldn't filter empty messages here 
		// as the parent might want to know about them
		process.send(msg);
	}
} : function(msg){
	if(this.pid == hot.pid) {
		process.send(msg);
	}
};

/**
 * @param {*} msg data sent from a forked child process via process.send
 * subscriber function, check if we are hot feed
 * if we are, push the message out to stdout 
 * if debug, load a different function ahead of time
 * note, alot more information will get to stdout if DEBUG
 * this might break clients that expect this process to run in parent mode
 * --don't run this as a parent outside of testing, use .fork()
 */
var subscribeAsParent = DEBUG ? function(msg){
	if(msg && this.pid == hot.pid) {
		msg.__hotcold = getCurrentFeedPids();
		msg.__hotcold.__sent_with = hot.pid;
		// using stringify here for easier reading while debugging
		console.log('SUBSCRIBE\t',JSON.stringify(msg)); 
	} else {
		// still send a null, false etc msg up to the parent
		// we shouldn't filter empty messages here 
		// as the parent might want to know about them
		process.send(msg);
	}
} :  function(msg){
	if(this.pid == hot.pid) {
		// do *not* use stringify here
		// parent of this code should not be expecting to JSON.parse()
		// since if this was being run in fork() mode, 
		// process.send will send an object directly to the process
		console.log(msg);
	}
};

/**
 * handler for when a forked process exits
 * @param {*} msg sent on exit
 * *ANYTHING* done here might be done twice
 * because the error event will sometimes be called *in addition* to the exit
 * https://nodejs.org/api/child_process.html#child_process_event_error
 */
var exit = function(code,signal){
	log('  EXIT\t\t',{
		pid: this.pid,
		code: code,
		signal: signal
	});
	
	// we purposefully exited the feed, for a restart, from a handled error etc
	if(code==0 && signal == 'SIGTERM') {
		return;
	}

	// something force killed a feed
	// test this by kill -9 HOT_FEED_PID 
	// exit this whole process as this is a serious exit signal
	// this hard exit will throw an error in the parent process
	// the parent can handle how it wants to restart (pm2, slack etc)
	if(signal == 'SIGKILL') {
		log('E_KILL\t\t','A feed recieved a SIGKILL, exiting Hot/Cold manager');
		process.exit('SIGKILL');
		return;
	}
	if(code === 1) {
 		// if hot errored -> trigger swapHotCold
		if(this.pid == hot.pid) {
			log('E_SWAP\t','Caught a hot feed error, swapping');
			swapHotAndCold(FEED_LOCATION);
			return;
		} 
		// if cold errored -> trigger refreshCold
		if(this.pid == cold.pid) {
			log('E_REFRESH\t','Caught a cold feed error, swapping');
			refreshCold(FEED_LOCATION);
			return;
		}
		// TODO write a test that checks if you error immediately, everything exits
		// should work because the first error will try to create a load feed
		// which will error and reach here, throwing up to the parent
		// if unhandled exit code from above
		// throw an unhandled error to the parent, 		
		var e = new Error(
			'Feed '+this.pid+' ',
			' code: '+code+
			' signal: ' +signal+
			' , terminating'
		);
		log_err(e);	
		throw e;	
		return;				
	}
};


/**
 * create a feed from location & register _subscribe on('message')
 * @param {string} feed location
 * @param {function} _subscribe callback for feed.on('message')
 * @param {function} _exit callback for feed.on('exit')
 */
var createFeed = function(feed,_subscribe,_exit){
	var f = child.fork(feed);
	log('  CREATE_FEED\t',{fork:feed,pid:f.pid});
	f.on('message',_subscribe);
	f.on('exit',_exit);
	// f.on('close',_exit);
	// f.on('disconnect',_exit);
	return f;
};

/**
 * get the current hot feed, if not there will create it
 * @param {string} feed location
 */
var getHotFeed = function(feed){
	// do this to avoid accidental zombie process'
	if(!hot) {
		log('GET_HOT\t\t','Started new hot feed fork');
		hot = createFeed(feed,subscribe,exit);
	}
	
	return hot;
};

/*
 * get the current cold feed, if not there will create it
 * @param {string} feed location
 */
var getColdFeed = function(feed){
	// do this to avoid accidental zombie process'
	if(!cold) {
		log('GET_COLD\t','Started new cold feed fork');
		cold = createFeed(feed,subscribe,exit);
	}

	return cold;
}

/**
 * create a new feed and store into load
 * kill hot
 * switch cold to hot
 * switch load to cold
 * Feeds: (a,b)   | a->hot, b->cold
 * Feeds: (a,b,c) | a->hot, b->cold, c->load
 * Feeds: (b,c)   | b->hot, c->cold
 * @param {string} feed location
 */
var swapHotAndCold = function(feed) {
	// create a new feed to replace the cold once we swap
	log('SWAP\t\t','Create new temp load feed:');
	var load = createFeed(feed,subscribe,exit);
	
	log('SWAP_ORIG\t',getCurrentFeedPids());
	
	// temp hold the oldHot feed
	// to ensure no gap between kill -> swap
	var oldHot = hot;
	hot = cold;
	cold = load;
	// kill *after* swapping
	// this sends SIGTERM
	oldHot.kill();
	// make load null to clear up memory
	load = null;

	log('SWAP_NEW\t',getCurrentFeedPids());
};

/**
 * create a new feed
 * switch cold to new feed
 * kill old feed
 * @param {string} feed location
 */
var refreshCold = function(feed) {
	// create a new feed to replace cold
	log('REF_COLD\t','Create new temp load feed:');
	var load = createFeed(feed,subscribe,exit);

	log('REF_COLD_ORIG\t',getCurrentFeedPids());

	// temp hold the oldCold feed
	// to ensure no gap between kill -> swap
	var oldCold = cold;
	cold = load;
	// kill *after* swapping
	// this sends SIGTERM
	oldCold.kill();
	// make load null to clear up memory
	load = null;
	log('REF_COLD_NEW\t',getCurrentFeedPids());
};


main();
