var num = require('num');

var MockExchange = function() {
	this.name = 'MockExchange';
	this.exchangeId = 0;
	this.key = 'key';
	this.secret = 'secret';
	this.clientId = 'clientid';
	this.passphrase = 'passphrase';
	this.fee = 0.0025;
};

this.prototype.buy = function(price, amount) {
	console.log("Mock a buy request");
}

this.prototype.sell = function(price, amount) {
	console.log("Mock a sell request");
}

module.exports = exports = MockExchange;