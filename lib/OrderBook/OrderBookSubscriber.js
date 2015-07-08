import config from 'config';
import {RedisWrapper} from '../Wrappers/redisWrapper';
import {OrderBook} from './OrderBook'
import {PriceAmount} from './PriceAmount'

// TODO: I hate that this is needed... Remove it and the other part marked with TODO asap
import {CoinbaseExchange} from '../Exchange/Coinbase/CoinbaseExchange';
import {BitstampExchange} from '../Exchange/Bitstamp/BitstampExchange';

let CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK');

export class OrderBookSubscriber {
    constructor(callbackObj, funcName) {
        RedisWrapper.subscribe(CHANNEL, (books) => {
            // Need to create the OrderBooks as objs from the rawness passed back from Redis
            console.log('obs books', books);

            let orderBooks = {};
            for(let book of books) {
                book = JSON.parse(book);
                let exchange = null; // TODO: We need a better way to do this...
                if(book.exchange.exchangeId == 0) {
                    exchange = new CoinbaseExchange();
                } else {
                    exchange = new BitstampExchange();
                }

                console.log('creating new ob', book.bid.price, book.bid.size);
                orderBooks[exchange.ExchangeId] = new OrderBook(
                    new PriceAmount(book.bid.price, book.bid.size),
                    new PriceAmount(book.ask.price, book.ask.size),
                    exchange);
            }

            console.log('OrderBookSubscriber subscribed', orderBooks[0] instanceof OrderBook, orderBooks);
            callbackObj[funcName](orderBooks);
        });
    }
}
