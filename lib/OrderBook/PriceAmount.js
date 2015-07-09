import num from 'num';

export class PriceAmount {
    constructor(price, amount) {
        this.price = num(price);
        this.amount = num(amount);
    }

    get Price() {
        return this.price;
    }

    get Amount() {
        return this.amount;
    }

    toString() {
        return JSON.stringify({
            Price: this.price.valueOf(),
            Amount: this.amount.valueOf()
        });
    }
}
