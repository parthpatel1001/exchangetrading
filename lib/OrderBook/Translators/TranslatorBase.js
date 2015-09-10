import {OrderBook} from '../OrderBook';
import {PriceAmount} from '../PriceAmount';

const orderBookInterval = 7500; // TODO: Move this into the config

export class OrderBookTranslatorBase {
    constructor(exchange) {
        this.exchange = exchange;
    }

    subscribe(callback) {
        // TODO: How to check that this is implemented in production mode in derived classes?
        setInterval(() => {
            var bid = (1.0 - Math.random()) * 250;
            var ask = bid - 1;
            // make sure the ask is realistic
            while (ask < bid) {
                ask = bid * (1.0 + Math.random());
            }
            return callback(new OrderBook(
                new PriceAmount(bid, (Math.random() * 5)),
                new PriceAmount(ask, (Math.random() * 5)),
                this.Exchange
            ));
        }, orderBookInterval);
    };

    get Exchange() {
        return this.exchange;
    }
}
