'use strict';
mainApp.controller('myAccountCtrl', function($mdDialog, $http, $rootScope, $scope, Upload, $location, loginService, $timeout, toastr, dataService) {
    var self = this;

    self.getUserDetails = getUserDetails;
    self.NumberofDocumentUploadedByUser = 0;
    self.getUserDetails();

    function getUserDetails() {
        var userId = loginService.getId();

        $http.get('/getTotalDocumentsUploadedByUser/' + userId).success(function(data) {
            console.log('Number of document uploaded: ' + data[0]["TotalDocuments"]);
            self.NumberofDocumentUploadedByUser = data[0]["TotalDocuments"];
        }).error(function() {
            alert('error');
        });
    }

});