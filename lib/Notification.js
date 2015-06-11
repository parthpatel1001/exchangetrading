var NotificationService = require('./Slack/SlackMessenger.js');
var NotificationService = new NotificationService();

var Notification = function() {
	this.message = function(body, opt) {
		NotificationService.message(body, opt);
	}
};

module.exports = exports = Notification;