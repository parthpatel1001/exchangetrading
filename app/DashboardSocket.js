/**
 * Created by parthpatel1001 on 5/14/15.
 */
var server = require('http').createServer();
var io = require('socket.io')(server);
var Redis = require("redis");
var OrderBookSubscriber = require('../lib/OrderBook/OrderBookSubscriber.js');
var OrderSubscriber = require('../lib/Order/OrderSubscriber.js');
var Order = require('../lib/Order/Order.js');
var config = require('config');
server.listen(8080); // TODO make this a config

OrderBookSubscriber = new OrderBookSubscriber(Redis);
OrderSubscriber = new OrderSubscriber(Redis,Order);

io.on('connection', function (socket) {
    OrderBookSubscriber.subscribeToOrderBookTop(
        config.get('EventChannels.ORDER_BOOK_TICK'),
        function(bookTop) {
            socket.emit(
                config.get('Sockets.ORDER_BOOK_SOCKET'),
                bookTop
            );
        }
    );

    OrderSubscriber.subscribeToLinkedOrderStream(
        config.get('EventChannels.LINKED_ORDER_STREAM'),
        function(order1,order2){
            var data = JSON.stringify([order1.serialize(),order2.serialize()]);
            socket.emit(
                config.get('Sockets.ORDER_BOOK_SOCKET'),
                data
            );
        }
    );
});