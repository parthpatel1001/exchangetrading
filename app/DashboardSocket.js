/**
 * Created by parthpatel1001 on 5/14/15.
 */
var server = require('http').createServer();
var io = require('socket.io')(server);
var Redis = require("redis");
var OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js');
var OrderSubscriber = require('../lib/Order/OrderSubscriber.js');
var Order = require('../lib/Order/Order.js');

server.listen(8080); // TODO make this a config

OrderBookSubscriber = new OrderBookSubscriber(Redis);
OrderSubscriber = new OrderSubscriber(Redis,Order);

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

    OrderSubscriber.subscribeToLinkedOrderStream(
        "LINKED_ORDER_STREAM", // TODO make this a config
        function(order1,order2){
            var data = JSON.stringify([order1.serialize(),order2.serialize()]);
            socket.emit(
                'LINKED_ORDER_STREAM_SOCKET',
                data
            );
        }
    );
});