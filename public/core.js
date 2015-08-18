var flitterMap = angular.module('flitterMap', []);

var socket = io();


function mainController($scope, $http) {
    $scope.formData = {};
    
    $scope.sync = function() {
        $http.get('api/ships').success(function(data) {
            $scope.ships = data;
            console.log('Load success:'+data);
                    $( ".draggable" ).draggable()
        }).error(function(data) {
            console.log('Load error: ' + data);
        });
    };

    $scope.spawnShip = function() {
        req = {name: $scope.formData.text};

        $http.post('/api/ships', req)
            .success(function(data) {
                // $scope.formData = {};
                $scope.ships = data;
                console.log('Spawn success: ' + data);
            })
            .error(function(data) {
                console.log('Spawn error: ' + data);
            });
    };

    $scope.move = function(id, offset) {
        console.log(id);
        socket.emit('shipmove', id);
        req = {xPos: offset.left, yPos: offset.top};
        $http.put('/api/ships/' + id, req)
            .success(function(data) {
                //$scope.ships = data;
                console.log('Move success: ' + data);
            })
            .error(function(data) {
                console.log('Move error: ' + data);
            });
    };

    $scope.update = function(id) {
        console.log('updating'+id);
        $http.get('api/ships').success(function(data) {
            $scope.ships = data;
            console.log('Load success:'+data);
                    $( ".draggable" ).draggable()
        }).error(function(data) {
            console.log('Load error: ' + data);
        });
    }

    $scope.kill = function(id) {
        console.log('kill');
        $http.delete('/api/ships/' + id)
            .success(function(data) {
                $scope.ships = data;
                console.log(data);
            }).error(function(data) {
                console.log('Kill error: ' + data);
            });
    };

    $scope.ping = function(id) {
        console.log('pong '+id);
    };

    socket.on('shipmove', function(msg){
        $scope.sync();
    });


    $scope.sync();
    
    $scope.$broadcast('dataloaded');
}

flitterMap.directive('myDraggable', ['$document', function($document) {
    return {
        link: function(scope, element, attr) {
            var startX = 0, startY = 0, x = 0, y = 0;

            element.css({
                position: 'absolute',
                left: element.attr('xpos'),
                top: element.attr('ypos')
            });

            element.on('mousedown', function(event) {
                event.preventDefault();
                startX = event.pageX ;
                startY = event.pageY ;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY-25;
                x = event.pageX-25;
                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            function mouseup() {
                // console.log(element.attr('mongoid'));
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
                if(element.offset().left>1200){
                    scope.kill(element.attr('mongoid'));
                }
                else{
                    scope.move(element.attr('mongoid'), element.offset());
                }
            }
        }
    };
}]);