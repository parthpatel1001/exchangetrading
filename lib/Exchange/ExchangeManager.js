export class ExchangeManager {
    constructor() {
        this.exchanges = {};
    }

    addExchange(ex) {
        this.exchanges[ex.ExchangeId] = ex;
        return this;
    };

    getExchange(exNum) {
        return this.exchanges[exNum];
    };

    getExchangeName(exNum) {
        return this.exchanges[exNum].Name;
    };
}
