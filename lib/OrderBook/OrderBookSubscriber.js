import config from 'config';
import {RedisWrapper} from '../Wrappers/redisWrapper';
import {OrderBook} from './OrderBook'
import {PriceAmount} from './PriceAmount'
import {ExchangeManager} from '../Exchange/ExchangeManager';

let CHANNEL = config.get('EventChannels.ORDER_BOOK_TICK');

export class OrderBookSubscriber {
    constructor(exchangeManager, callbackObj, funcName) {
        RedisWrapper.subscribe(CHANNEL, (books) => {
            // Need to create the OrderBooks as objs from the rawness passed back from Redis
            let orderBooks = [];
            for(let book of books) {
                book = JSON.parse(book);
                let exchange = exchangeManager.GetExchange(book.exchange.exchangeId);

                orderBooks.push(new OrderBook(
                    new PriceAmount(book.bid.price, book.bid.amount),
                    new PriceAmount(book.ask.price, book.ask.amount),
                    exchange));
            }

            callbackObj[funcName](orderBooks);
        });
    }
}
