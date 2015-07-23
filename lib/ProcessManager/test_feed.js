var rand = function(){
	return Math.floor(Math.random() * 100)+1;
};
var sendAsParent = function(msg){
	console.log(msg);
};
var sendAsChild = function(msg) {
	process.send(msg);
};
var main = function(){
	// load which function to handle sending the feed data ahead of time
	// instead of checking the bit at runtime for each tick
	// http://stackoverflow.com/questions/30763112/how-to-tell-if-child-node-js-process-was-from-fork-or-not
	var send = process.send === undefined ? sendAsParent : sendAsChild;	
/*
 * ------------------------------------------------------------------------------------------------------------
 * a real feed would initialize here, and call send() when it recieved an appropiate event
 */
	// have the feed error every rand ms
	// todo pass this into args so we can write tests for it
	var ERROR_IN_MS = (rand())*300;

	// send an event every .5 s
	var SEND_EVENT_EVERY_MS = 500;

	// delay real feed events by 5s
	// simulate it taking time to warm up a feed
	var DELAY_FEED_BY = 5000;

	// simulate it taking some time to warm up before being ready
	var delayId = setInterval(function(){
		send(null);
	},SEND_EVENT_EVERY_MS);

	// after 5s, clear the null message interval and send a rand number
	setTimeout(function(){
		// clear the null message repeater
		clearInterval(delayId);
		// send a rand data ever .5s
		setInterval(function(){
			send({
				data: Math.floor(Math.random() * 100)+1,
				time: new Date().getTime()
			});
		},SEND_EVENT_EVERY_MS);
	},DELAY_FEED_BY);

	
	console.log('FEED\t\t %s going to error in %dms',process.pid,ERROR_IN_MS);
	setTimeout(function(){
		throw new Error('Im the motherf*@$ jugernaut b*&!@');
	},ERROR_IN_MS);
/*
 * ------------------------------------------------------------------------------------------------------------
 */	
};

main();