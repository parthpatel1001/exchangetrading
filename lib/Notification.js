var Notification = function(NotificationService) {
	this.message = function(body, callback) {
		NotificationService.message(body, callback);
	}
};

module.exports = exports = Notification;