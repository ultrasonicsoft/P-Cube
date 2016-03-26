'use strict';
mainApp.controller('DocumentsUploadedReportCtrl', function ($mdDialog, $http, $filter, $q, toastr) {
    var self = this;
    self.uploadedDocumentsReport = [];

    function getTotalDocumentsUploadedReport() {
        $http.get('/getTotalDocumentsUploadedReport').success(function (data) {
            self.uploadedDocumentsReport = data[0];
        }).error(function () {
            alert('error');
        });
    };

    self.getTotalDocumentsUploadedReport = getTotalDocumentsUploadedReport;
    
    self.getTotalDocumentsUploadedReport();
});