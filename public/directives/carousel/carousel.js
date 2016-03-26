'use strict';
mainApp.controller('CarouselCtrl', function($rootScope, $scope, $http ) {
    var self = this;

    self.myData = [];

    self.gridOptions = {
        enableFiltering: true,
        showGridFooter: true,
        enableGridMenu: true,
        multiSelect: false,
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [10, 10, 10, 10] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        exporterPdfHeader: { text: "Lawyer Document Store", style: 'headerStyle' },
        exporterPdfFooter: function(currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function(docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'portrait',
        exporterPdfPageSize: 'LETTER',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        onRegisterApi: function(gridApi) {
            self.gridApi = gridApi;
        },
        columnDefs: [
            { name: 'User Name', field: 'userName', width: "10%" },
            { name: 'Comments', field: 'comments', width: "10%" },
            { name: 'Application Country', field: 'applicationCountry', width: "10%" },
            { name: 'Application Service Center', field: 'applicationServiceCenter', width: "10%" },
            { name: 'Application Process', field: 'applicationProcess', width: "10%" },
            { name: 'Application Type', field: 'applicationType', width: "10%" },
            { name: 'Passport Category', field: 'passportCategory', width: "10%" },
            { name: 'BLS Receipt Number', field: 'BLSReceiptNumber', width: "10%" },
            { name: 'Application accepted by BLS', field: 'applicationAcceptedByBLS', width: "10%" },
            { name: 'Application Processed on Date', field: 'applicationProcessedOnDate', width: "10%" },
            { name: 'Application Processed and submitted to Consulate', field: 'applicationProcessedAndSubmittedToConsulate', width: "10%" },
            { name: 'Passport received at BLS Center', field: 'passportReceivedAtBLSCenter', width: "10%" },
            { name: 'Passport handed over to Applicant', field: 'passportHandedOverToApplicant', width: "10%" },
            { name: 'Passport Dispatched to Applicant', field: 'passportDispatchedToApplicant', width: "10%" },
            { name: 'Application status', field: 'applicationStatus', width: "10%" },
            { name: 'Current Residence Country', field: 'currentResidenceCountry', width: "10%" },
            { name: 'Current Residence State', field: 'currentResidenceState', width: "10%" },
            { name: 'Total Processing Time', field: 'totalProcessingTime', width: "10%" },
            { name: 'Days elapsed', field: 'daysElapsed', width: "10%" },
            { name: 'Case added to the tracker', field: 'caseAddedToTheTracker', width: "10%" },
            { name: 'Last Updated', field: 'lastUpdated', width: "10%" },
        ],
        rowHeight: 50,
        data: self.myData,
        enableColumnMenus: false,
        enableRowSelection:false,
        enableRowHeaderSelection: false
    };

    self.gridOptions.onRegisterApi = function(gridApi) {
        self.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function(row) {
            self.selectedDocId = row.entity.id;
            self.selectedDocumentTags = [];
            if (row.entity.tag1 && !(row.entity.tag1 === 'undefined'))
                self.selectedDocumentTags.push(row.entity.tag1);
            if (row.entity.tag2 && !(row.entity.tag2 === 'undefined'))
                self.selectedDocumentTags.push(row.entity.tag2);
            if (row.entity.tag3 && !(row.entity.tag3 === 'undefined'))
                self.selectedDocumentTags.push(row.entity.tag3);
            if (row.entity.tag4 && !(row.entity.tag4 === 'undefined'))
                self.selectedDocumentTags.push(row.entity.tag4);
            if (row.entity.tag5 && !(row.entity.tag5 === 'undefined'))
                self.selectedDocumentTags.push(row.entity.tag5);
        });
    };

    self.getAllDocuments = getAllDocuments;
    self.getAllDocuments();
    
    function getAllDocuments() {
        $http({
            url: '/getAllApplications',
            method: "GET"
        }).success(function(data) {
            self.myData = data;
            self.gridOptions.data = self.myData;

        }).error(function() {
            alert('error');
        });

    }

});