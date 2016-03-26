'use strict';
mainApp.controller('HistoryCtrl', function ($mdDialog, $http, $filter, $q, toastr) {
    var self = this;
    self.uploadedHistories = [];

    function getUploadedHistory() {
        $http.get('/getUploadedHistory').success(function (data) {
            self.uploadedHistories = data[0];
        }).error(function () {
            alert('error');
        });
    };

    self.getUploadedHistory = getUploadedHistory;
    
    self.getUploadedHistory();
});