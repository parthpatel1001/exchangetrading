/**
 * Created by parthpatel1001 on 5/14/15.
 */
var server = require('http').createServer();
var io = require('socket.io')(server);
var Redis = require("redis");
var OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js');

server.listen(8080); // TODO make this a config

OrderBookSubscriber = new OrderBookSubscriber(Redis);

io.on('connection', function (socket) {
    OrderBookSubscriber.subscribeToOrderBookTop(
        'ORDER_BOOK_TICK', // TODO make this a config
        function(bookTop) {
            socket.emit(
                'ORDER_BOOK_SOCKET', // TODO make this a config
                bookTop
            );
        }
    );
});