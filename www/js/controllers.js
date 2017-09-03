angular.module('myVault.controllers',[])

.controller('LoginController',['$scope','$state',function($scope,$state) {
    $scope.signin = true;
    $scope.submit = function(){
        //TODO Sigin and Sign up stuff
        $state.transitionTo('app.pinned');
    };
    $scope.switchMode = function() {
        $scope.signin = !$scope.signin;
    };
    $scope.user = {};
}])

.controller('SidebarController', ['$scope', function($scope) {

}])

.controller('PinnedController', ['$scope', function($scope) {
    
}])
.controller('NotesController', ['$scope', function($scope) {
    
}])
.controller('PwordsController', ['$scope', function($scope) {
    
}])
.controller('CardsController', ['$scope', function($scope) {
    
}])
;