import num from 'num';

export class Balance {
    balance;

    constructor(balanceIn) {
        this.balance = balanceIn;
    }

    getUSDAvailable() {
        return num(this.balance.usd_avail);
    };

    getBTCAvailable() {
        return num(this.balance.btc_avail);
    };

    setUSDAvailable(amount) {
        this.balance.usd_avail = amount.toString();
    };

    setBTCAvailable(amount) {
        this.balance.btc_avail = amount.toString();
    };

    getExchangeId() {
        return this.balance.exchangeId;
    };

    serialize() {
        return JSON.stringify(this.balance);
    };
}
