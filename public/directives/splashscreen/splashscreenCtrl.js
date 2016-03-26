'use strict';
mainApp.controller('splashscreenCtrl', function ($mdDialog, $http, $rootScope, loginService, dataService, toastr) {
    var self = this;

    function close() {
        $mdDialog.cancel();
    }
    self.close = close;
});