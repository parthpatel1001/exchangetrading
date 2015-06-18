var
    Arbiter = require('../lib/Trading/Arbiter.js'),
    OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js'),
    OrderGenerator = require('../lib/Order/OrderGenerator.js'),
    OrderPublisher = require('../lib/Order/OrderPublisher.js'),
    Redis = require("redis");

var redisClient = Redis.createClient();

OrderPublisher = new OrderPublisher(redisClient);

OrderGenerator = new OrderGenerator();
OrderGenerator.registerOrderPublisher(OrderPublisher);

Arbiter = new Arbiter();
Arbiter.registerOrderGenerator(OrderGenerator);

OrderBookSubscriber = new OrderBookSubscriber();
OrderBookSubscriber.subscribeToOrderBookTop(Arbiter.subscribeTo2ExchangeArbOppurtunities);
