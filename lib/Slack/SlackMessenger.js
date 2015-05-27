var request = require('request');

var hook_url = '';

var SlackMessenger = function() 
{
	this.message = function(body, callback) {
		request({
			url: hook_url,
			method: 'POST',
			body: JSON.stringify({
				username: "SmartBot",
				text: body
			}),
		}, function(err, res, body) {
			if(err) {
				console.log(err);
			}
		});
	};
};

module.exports = exports = SlackMessenger;