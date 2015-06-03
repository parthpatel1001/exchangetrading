var request = require('request');
var config = require('config');

var SlackMessenger = function() {
	this.message = function(body, opt) {
        if(opt && opt.hook_url) {
            var channel = opt.channel || config.get('Notification.Slack.default_channel'); //can be direct message as well
            var botname = opt.botname || 'SmartBot';
            var important = opt.important || false;

            var hook_url = opt.hook_url;
            request({
                url: hook_url,
                method: 'POST',
                body: JSON.stringify({
                    username: botname,
                    channel: channel,
                    text: important ? '*' + body + '*' : body,
                    mrkdwn: important
                }),
            }, function (err, res, body) {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            // if we didn't provide an endpoint for slack
            // send the message to the console
            console.log("Body: ",body,"options: ",opt);
        }
	};
};

module.exports = exports = SlackMessenger;