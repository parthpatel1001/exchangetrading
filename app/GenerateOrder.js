/**
 * Created by parthpatel1001 on 5/14/15.
 */
var
    Redis = require("redis"),
    Arbiter = require('../lib/Trading/Arbiter.js'),
    CoinbaseExchange  = require('../lib/Exchange/Coinbase/CoinbaseExchange.js'),
    BitstampExchange  = require('../lib/Exchange/Bitstamp/BitstampExchange.js'),
    ExchangeManager   = require('../lib/Exchange/ExchangeManager.js'),
    OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js'),
    Order = require('../lib/Order/Order.js'),
    OrderGenerator = require('../lib/Order/OrderGenerator.js'),
    OrderPublisher = require('../lib/Order/OrderPublisher.js');

// TODO move this to a config
var COINBASE_EXCHANGE_ID = 0;
var BITSTAMP_EXCHANGE_ID = 1;
ExchangeManager = new ExchangeManager()
    .addExchange(new CoinbaseExchange(COINBASE_EXCHANGE_ID))
    .addExchange(new BitstampExchange(BITSTAMP_EXCHANGE_ID));


OrderGenerator = new OrderGenerator(Order);
// TODO move this to a config
OrderGenerator.registerOrderPublisher(new OrderPublisher(Redis,'LINKED_ORDER_STREAM'));

// TODO move this to a config
var ARBITRAGE_THRESHOLD = .007;
Arbiter = new Arbiter(ARBITRAGE_THRESHOLD);
Arbiter.registerOrderGenerator(OrderGenerator);

OrderBookSubscriber = new OrderBookSubscriber(Redis);
OrderBookSubscriber.subscribeToOrderBookTop('ORDER_BOOK_TICK', Arbiter.subscribeTo2ExchangeArbOppurtunities);
