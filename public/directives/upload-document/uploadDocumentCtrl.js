'use strict';

mainApp.controller('uploadDocumentCtrl', function($mdDialog, $http, $rootScope, $scope, Upload, $location, $timeout, toastr, dataService) {
    var self = this;

    self.readonly = false;
    self.options = ["Plaintiff", "Defendant"];
    self.caseTypes = [];
    self.document = {};
    self.document.tags = [];
    self.document.lawyerComments = '';
    self.document.selectedOption = "Plaintiff";

    self.hide = hide;
    self.cancel = cancel;
    self.uploadNewDocument = uploadNewDocument;
    self.uploadFile = uploadFile;
    self.getAllCaseTypes = getAllCaseTypes;
    self.editDocument = editDocument;
    self.updateDocument = updateDocument;
    self.showNewDocumentSection = true;
    self.document.selectedCaseTypeValue = "";


    self.reviewDocument = reviewDocument;
    self.correctDocument = correctDocument;

    self.showNewDocumentSection = true;
    self.isEditMode = false;
    self.uploadFiles = uploadFiles;
    self.picFile = [];
    self.files = [];
    self.depositionFile = [];
    self.uploadDepositionFile = uploadDepositionFile;

    self.suffixes = ['Sr.', 'Jr.', 'III', 'Ph.D.', 'R.N.', 'M.D.']
    self.showProgressBar = false;

    getAllCaseTypes();

    function getAllCaseTypes() {
        $http.get('/getAllCaseTypes').success(function(data) {
            self.caseTypes = data[0];
            editDocument();
        }).error(function() {
            alert('error');
        });
    }

    function editDocument() {
        var selectedDoc = dataService.getSelectedDocument();
        self.isEditMode = dataService.getDocumentEditMode();

        if (!self.isEditMode) {
            return;
        }

        self.isEditMode = true;

        self.document.id = selectedDoc.id;
        self.document.firstNameOfExpert = selectedDoc.Expert_FName;
        self.document.lastNameOfExpert = selectedDoc.Expert_LName;
        self.document.practiceArea = selectedDoc.practiceArea;
        self.document.dateTaken = new Date(selectedDoc.dateTaken);

        // var importedPltDef = selectedDoc["plt/def"];
        // if(importedPltDef.indexOf("Plt") > -1 || importedPltDef.indexOf("Plt") > -1){
        //     self.document.selectedOption = "PlainTiff";
        // }
        // else if(importedPltDef.indexOf("Def") > -1)

        self.caseTypes.forEach(function(caseType) {
            if (caseType.caseType === selectedDoc.caseType) {
                self.document.selectedCaseType = caseType.id;
            }
        }, this);

        self.document.firstNameOfLawyer = selectedDoc.Lawyer_FName;
        self.document.lastNameOfLawyer = selectedDoc.Lawyer_LName;
        self.document.jurisdiction = selectedDoc.jurisdiction;

        if (selectedDoc.tag1 == "" &&
            selectedDoc.tag2 == "" &&
            selectedDoc.tag3 == "" &&
            selectedDoc.tag4 == "" &&
            selectedDoc.tag5 == "") {
            self.document.tags = [];
        }
        else {
            var tags = [];
            if (selectedDoc.tag1 && !(selectedDoc.tag1 === 'undefined'))
                tags.push(selectedDoc.tag1);
            if (selectedDoc.tag2 && !(selectedDoc.tag2 === 'undefined'))
                tags.push(selectedDoc.tag2);
            if (selectedDoc.tag3 && !(selectedDoc.tag3 === 'undefined'))
                tags.push(selectedDoc.tag3);
            if (selectedDoc.tag4 && !(selectedDoc.tag4 === 'undefined'))
                tags.push(selectedDoc.tag4);
            if (selectedDoc.tag5 && !(selectedDoc.tag5 === 'undefined'))
                tags.push(selectedDoc.tag5);
            Object.assign(self.document.tags, tags);
        }
        self.document.lawyerComments = selectedDoc.lawyerComments;

    }

    function uploadFile(file) {
        $http({
            method: 'POST',
            url: '/resources/messages',
            data: message, // your original form data,
            headers: { 'Content-Type': 'multipart/form-data' }
        }).
            success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                deferred.reject(status);
            });
    }

    function hide() {
        $mdDialog.hide();
    };

    function cancel() {
        $mdDialog.cancel();
    };
    function uploadNewDocument() {
        self.showProgressBar = true;

        if (self.isEditMode) {
            self.updateDocument(null);
            return;
        }

        if (self.depositionFile === undefined)
            return;

        self.document.format = '';
        self.document.submitter = $rootScope.loggedInUserName;

        if (self.document.lawyerComments) {
            self.document.lawyerComments = "";
        }

        Upload.upload({
            url: '/uploadNewDocument',
            data: {
                depositionFile: self.depositionFile[0], supportingFiles: self.files, newDocument: self.document
            }
        }).then(function(response) {
            $timeout(function() {
                toastr.success('Document sent for approval!');
                self.hide();
                $location.url('/dashboard');
                $rootScope.$emit("refreshGridDataEvent");
                self.showProgressBar = false;
                alert('File uploaded to server successfully!');
            });
        }, function(response) {
            self.showProgressBar = false;
            alert('Error occured during uploading document to server...');

            if (response.status > 0) {
                toastr.error('Failed to upload document. Error: ' + response.status + ': ' + response.data);

            }
        }, function(evt) {
            $scope.progress =
                Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    };

    function updateDocument(file) {
        self.document.format = 'pdf';
        self.document.submitter = $rootScope.loggedInUserName;

        if (file) {
            //Upload document to server
            file.upload = Upload.upload({
                url: '/updateDocument',
                data: { file: file, newDocument: self.document }
            });

            file.upload.then(function(response) {
                $timeout(function() {
                    file.result = response.data;
                    toastr.success('Document sent for approval!');
                    self.hide();
                    $rootScope.$emit("refreshGridDataEvent");
                });
            }, function(response) {
                if (response.status > 0) {
                    $scope.errorMsg = response.status + ': ' + response.data;
                    toastr.error('Failed to upload document. Error: ' + response.status + ': ' + response.data);
                    //alert($scope.errorMsg);
                }
            }, function(evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
        else {
            $http.post('/updateDocument', { file: null, newDocument: self.document })
                .success(function(user) {
                    toastr.success('Document Updated!');
                    self.hide();
                    $rootScope.$emit("refreshGridDataEvent");
                })
                .error(function(error) {
                    toastr.error('Failed to update document. Error: ' + error);
                });
        }

    };

    function reviewDocument() {

        var selectedCaseType = self.caseTypes.filter(function(obj) {
            return obj.id == self.document.selectedCaseType;
        });

        if (selectedCaseType.length > 0) {
            self.document.selectedCaseTypeValue = selectedCaseType[0].caseType;
        }
        self.showNewDocumentSection = false;
    }

    function correctDocument() {
        self.showNewDocumentSection = true;
    }

    function uploadFiles(files) {
        self.files = files;

    };

    function uploadDepositionFile(files) {
        self.depositionFile = files;
    };
});