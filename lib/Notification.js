var Notification = function(NotificationService) {
	this.message = function(body, opt) {
		NotificationService.message(body, opt);
	}
};

module.exports = exports = Notification;