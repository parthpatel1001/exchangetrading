import num from 'num';

export class MockExchange {
	constructor() {
        this.name = 'MockExchange';
        this.exchangeId = 0;
        this.key = 'key';
        this.secret = 'secret';
        this.clientId = 'clientid';
        this.passphrase = 'passphrase';
        this.fee = 0.0025;
    }

    buy(price, amount) {
        console.log("Mock a buy request");
    }

    sell(price, amount) {
        console.log("Mock a sell request");
    }
}
