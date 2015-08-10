export class ExchangeManager {
    constructor(...exchanges) {
        // Map needs to be init'd with an array of [key,value] arrays so use a generator func to do it
        let exchGen = function* () {
            for(let exch of  exchanges) {
                yield [exch.ExchangeId, exch];
            }
        };

        this.exchanges = new Map(exchGen());
    }

    AddExchange(ex) {
        this.exchanges.set(ex.ExchangeId, ex);
        return this;
    };

    GetExchange(exNum) {
        return this.exchanges.get(exNum);
    };
}
