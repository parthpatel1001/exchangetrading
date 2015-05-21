var dashboard = angular.module('dashboard',[]);
var socket = io('http://localhost:8080');
dashboard.controller('OrderBookTopController',['$scope', function($scope){
    $scope.books = [{bid:{price:0,amount:0},ask:{price:0,amount:0}},{bid:{price:0,amount:0},ask:{price:0,amount:0}}];
    $scope.linked_orders = [];
    $scope.lastUpdated = 0;

    setInterval(function(){
        $scope.$apply(function(){
            $scope.lastUpdated++;
        });
    },1000);
    socket.on(
        'ORDER_BOOK_SOCKET', // TODO make this a config
        function(data) {
            $scope.$apply(function(){
                $scope.lastUpdated = 0;
                $scope.books = data;
            });
        }

    );
    var pushToLinkedOrderStack = function(orders) {
        $scope.$apply(function(){
            if($scope.linked_orders.length >= 10) {
                $scope.linked_orders.shift();
            }
            $scope.linked_orders.unshift(orders);
        });
    };
    socket.on(
        'LINKED_ORDER_STREAM_SOCKET', //TODO make this a config
        function(data) {
            console.log(data);
            var orders = JSON.parse(data);
            var order1 = JSON.parse(orders[0]);
            var order2 = JSON.parse(orders[1]);

            pushToLinkedOrderStack([order1,order2]);
            console.log($scope.linked_orders);
        }
    );
    socket.on('connect_error',function(){
        alert('socket error');
        socket.disconnect();
    });
}]);