'use strict';

mainApp.controller('LogoutCtrl', function ($rootScope, $scope, $location, $http, $mdDialog, toastr) {
    var confirm = $mdDialog.confirm()
          .title('Logout?')
          .content('Do you really want to log out from system?')
          .ariaLabel('Lucky day')
          .ok('Yes')
          .cancel('No');
    $mdDialog.show(confirm).then(function () {
        $http.post('/logout').success(function () {
            toastr.success('You have logged out');
            $rootScope.isLoggingRequired = true;
            $location.url('/');
        }).error(function () {
            //toastr.error('Failed to logged out.')
        });
    }, function () {
        $location.url('/dashboard');
        toastr.info('Continue working on system...', 'Logout Cancelled');
    });
});