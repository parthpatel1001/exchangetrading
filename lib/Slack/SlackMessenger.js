var request = require('request');

var hook_url = '';

var SlackMessenger = function() {
	this.message = function(body, opt) {
		var channel = opt.channel || '#log'; //can be direct message as well
		var botname = opt.botname || 'SmartBot';
		var important = opt.important || false;

		request({
			url: hook_url,
			method: 'POST',
			body: JSON.stringify({
				username: botname,
				channel: channel,
				text: important ? '*' + body + '*' : body,
				mrkdwn: important
			}),
		}, function(err, res, body) {
			if(err) {
				console.log(err);
			}
		});
	};
};

module.exports = exports = SlackMessenger;