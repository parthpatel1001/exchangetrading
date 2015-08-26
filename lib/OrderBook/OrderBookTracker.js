import {Track} from '../Track/Track.js';

let PREFIX = 'orderbook.tick.';

export class OrderBookTracker {
    trackOrderBook(orderBookTop){
        console.log('trackOrderBook bookTop', orderBookTop);
        for (let book of orderBookTop) {
            if(book) {
                let keyStart = PREFIX + book.Exchange.Name;
                Track.gauge(keyStart + '.bid.price',book.bid.price);
                Track.gauge(keyStart + '.bid.amount',book.bid.amount);
                Track.gauge(keyStart + '.ask.price',book.ask.price);
                Track.gauge(keyStart + '.ask.amount',book.ask.amount);
            }
        }
    }
}
