'use strict';
angular.module('myApp').controller('RegisterUserCtrl', function($scope, $modalInstance) {

    $scope.register = function () {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});