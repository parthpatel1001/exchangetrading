var dashboard = angular.module('dashboard',[]);
var socket = io('http://localhost:8080');
dashboard.controller('OrderBookTopController',['$scope', function($scope){
    $scope.books = [{bid:{price:0,amount:0},ask:{price:0,amount:0}},{bid:{price:0,amount:0},ask:{price:0,amount:0}}];
    $scope.lastUpdated = 0;

    setInterval(function(){
        $scope.$apply(function(){
            $scope.lastUpdated++;
        });
    },1000);
    socket.on(
        'ORDER_BOOK_SOCKET', // TODO make this a config
        function(data) {
            console.log(data);
            $scope.$apply(function(){
                $scope.lastUpdated = 0;
                $scope.books = data;
            });
        }

    );
    socket.on('connect_error',function(){
        alert('socket error');
        socket.disconnect();
    });
}]);