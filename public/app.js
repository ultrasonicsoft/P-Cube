'use strict';
// Declare app level module which depends on views, and components
var mainApp = angular.module('myApp',
    [
        'ngRoute',
        'ngAnimate',
        'ngMaterial',
        'toastr',
        'ui.grid',
        'ui.grid.resizeColumns',
        'ui.grid.selection',
        'ui.grid.pinning',
        'ui.grid.autoResize',
        'ui.grid.selection',
        'ui.grid.exporter',
        'ui.grid.grouping',
        'ngFileUpload',
        'xeditable'
    ])
    .controller('WebShopCtrl',
        function ($rootScope, $scope, $mdSidenav, $log) {
            $rootScope.isLoggingRequired = true;
            $rootScope.showProgressBar = false;

        });

mainApp.config(function ($routeProvider, $locationProvider, $httpProvider, toastrConfig) {
    angular.extend(toastrConfig, {
        autoDismiss: false,
        closeButton: true,
        closeHtml: '<button>&times;</button>',
        containerId: 'toast-container',
        maxOpened: 0,
        newestOnTop: true,
        positionClass: 'toast-top-center',
        preventDuplicates: false,
        preventOpenDuplicates: false,
        timeOut: 1000,
        target: 'body'
    });
    //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function ($q, $timeout, $http, $location, $rootScope) {
        // Initialize a new promise
        var deferred = $q.defer();
        
        // Make an AJAX call to check if the user is logged in
        $http.get('/loggedin').success(function (user) {
            // Authenticated
            if (user !== '0')
                /*$timeout(deferred.resolve, 0);*/
                deferred.resolve();

            // Not Authenticated
            else {
                $rootScope.message = 'You need to log in.';
                //$timeout(function(){deferred.reject();}, 0);
                deferred.reject();
                $location.url('/login');
            }
        });

        return deferred.promise;
    };
    
    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.interceptors.push(function ($q, $location) {
        return {
            response: function (response) {
                // do something on success
                return response;
            },
            responseError: function (response) {
                if (response.status === 401)
                    $location.url('/login');
                return $q.reject(response);
            }
        };
    });

    $routeProvider
        .when('/', {
            templateUrl: 'directives/carousel/carousel.html',
            controller: 'CarouselCtrl'
        })
        .when('/dashboard', {
            templateUrl: 'directives/dashboard/dashboard.html',
            controller: 'DashboardCtrl',
            resolve: {
                loggedin: checkLoggedin
            }
        })
        .when('/users', {
            templateUrl: 'directives/users/users.html',
            controller: 'UsersCtrl'
        })
        .when('/caseTypes', {
            templateUrl: 'directives/case-types/caseTypes.html',
            controller: 'CaseTypesCtrl'
        })
        .when('/history', {
            templateUrl: 'directives/history/history.html',
            controller: 'HistoryCtrl'
        })
        .when('/documentsUploadedReport', {
            templateUrl: 'directives/documentsUploadedReport/document-uploaded-report.html',
            controller: 'DocumentsUploadedReportCtrl'
        })
        .when('/search-document', {
            templateUrl: 'directives/search-document/search-document.html',
            controller: 'SearchDocumentCtrl'
        })
        .when('/upload-document', {
            templateUrl: 'directives/upload-document/upload-document.html',
            controller: 'uploadDocumentCtrl'
        })
        .when('/my-account', {
            templateUrl: 'directives/my-account/my-account.html',
            controller: 'myAccountCtrl'
        })
        .when('/logout', {
            templateUrl: 'directives/carousel/carousel.html',
            controller: 'LogoutCtrl'
        })
        .when('/ads', {
            templateUrl: 'directives/ads-manager/manage-ads.html',
            controller: 'adsManagerCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    //================================================
}).run(function ($rootScope, $http, $location) {
    $rootScope.message = '';
    //editableOptions.theme = 'bs2';
    $rootScope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    
    // Logout function is available in any pages
    $rootScope.logout = function () {
        $rootScope.message = 'Logged out.';
        $http.post('/logout');
    };
});

mainApp.directive('login', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/login/login.html',
        controller: 'LoginCtrl'
    };
});

mainApp.directive('carouselImages', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/carousel/carousel.html',
        controller: 'CarouselCtrl'
    };
});

mainApp.directive('searchDocument', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/search-document/search-document.html',
        controller: 'SearchDocumentCtrl'
    };
});

mainApp.directive('uploadDocument', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/upload-document/upload-document.html',
        controller: 'uploadDocumentCtrl'
    };
});

mainApp.directive('caseTypes', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/case-types/caseTypes.html',
        controller: 'CaseTypesCtrl'
    };
});

mainApp.directive('users', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/users/users.html',
        controller: 'UsersCtrl'
    };
});