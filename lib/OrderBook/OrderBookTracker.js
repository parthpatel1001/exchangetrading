import {Track} from '../Track/Track.js';
import config from 'config';

let PREFIX = 'orderbook.tick.';

//console.log('exchangeTracker exchangeConfig', exchangeConfig);
//for(let exchange of exchangeConfig) {
//    console.log('exchange', exchange);
//    exchangeNames.set(exchange.id, exchange.name);
//}

export class OrderBookTracker {
    trackOrderBook(bookTop){
        console.log('trackOrderBook bookTop', bookTop);
        for(let book of bookTop) {
            if(book) {
                console.log('trackOrderBook', book);

                let keyStart = PREFIX + book.exchange.Name;
                Track.gauge(keyStart + '.bid.price',book.bid.price);
                Track.gauge(keyStart + '.bid.amount',book.bid.amount);
                Track.gauge(keyStart + '.ask.price',book.ask.price);
                Track.gauge(keyStart + '.ask.amount',book.ask.amount);
            }
        }
    }
}
