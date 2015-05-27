var Notification = function(NotificationService) {
	this.message = function(body, callback) {
		(new NotificationService).message(body, callback);
	}
};

module.exports = exports = Notification;