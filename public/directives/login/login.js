'use strict';

mainApp.controller('LoginCtrl', function ($rootScope, $scope, $location, $http, loginService, toastr, $window) {

    $scope.email = "admin";
    $scope.password = "Jay100";


    $scope.login = function () {
        // $rootScope.loggedInUserName = "User";
        $rootScope.isLoggingRequired = true;

        $rootScope.showProgressBar = true;

        $http.post('/login', {
            username: $scope.email,
            password: $scope.password
        })
            .success(function (user) {
                // No error: authentication OK
                //myService.set(user.name);
                $rootScope.showProgressBar = false;

                $rootScope.message = 'Authentication successful!';
                $rootScope.isLoggingRequired = false;
                $rootScope.loggedInUserName = $scope.email;
                loginService.set(user);
                $rootScope.isAdmin = user.isAdmin;
                toastr.success("You are logged in the system", 'Welcome ' + $rootScope.loggedInUserName);
                $location.url('/dashboard');
            })
            .error(function () {
                // Error: authentication failed
                toastr.error("Invalid username or password. Please try again...", 'Login Failed');
                $location.url('/login');
                $rootScope.showProgressBar = false;

            });
    }

    $scope.octlaLogin = function () {
        $rootScope.loggedInUserName = $scope.email;
        $rootScope.isLoggingRequired = false;
        $rootScope.showProgressBar = true;

        $http.post('/octlaLogin', {
            username: $scope.email,
            password: $scope.password
        })
            .success(function (user) {
                $rootScope.showProgressBar = false;

                $window.location.href = user.gotoUrl;
                if (user) {
                    alert('octla login worked!');
                    
                    $rootScope.showProgressBar = false;

                    $rootScope.message = 'Authentication successful!';
                    $rootScope.isLoggingRequired = false;
                    $rootScope.loggedInUserName = $scope.email;
                    loginService.set(user);
                    toastr.success("You are logged in the system", 'Welcome ' + $rootScope.loggedInUserName);
                    $location.url('/dashboard');
                    // $location.url(user.gotoUrl);
                }
                else {
                    alert('invalid octla login details');
                }

            })
            .error(function () {
                $rootScope.showProgressBar = false;
                alert("error");
            });
    }

    $scope.registerUser = function () {

        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'directives/register/register.html',
            controller: 'RegisterUserCtrl'
        });
    }
});