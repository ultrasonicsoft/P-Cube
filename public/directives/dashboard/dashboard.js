'use strict';

mainApp.controller('DashboardCtrl', function($scope, $timeout, $mdDialog, $rootScope, toastr,
    $location, $http, $mdSidenav, $log, loginService, dataService, $q, $interval) {

    var self = this;
    self.tags = [];
    self.showSearchSection = false;
    self.showTags = false;
    self.myData = [];
    self.selectedDocumentTags = [];
    self.loggedInUser = null;
    self.isAdmin = false;
    self.approverComments = null;
    self.selectedDocId = -1;
    self.showRejected = false;
    self.sampleAction = sampleAction;
    self.openMenu = openMenu;
    self.updateCaseTypesVisibility = updateCaseTypesVisibility;
    self.showDataGrid = true;
    self.showCaseTypes = false;

    self.updateUsersVisibility = updateUsersVisibility;
    self.showUsers = false;
    self.isDataLoading = true;

    $rootScope.isLoggingRequired = false;
    self.isAdminLogin = isAdminLogin;
    self.onUploadNewDocument = onUploadNewDocument;

    function onUploadNewDocument() {
        dataService.setDocumentEditMode(false);
    }

    self.isAdminLogin();

    function isAdminLogin() {
        return $q(function(resolve, reject) {
            $http({
                method: "GET",
                url: "loggedInUser"
            }).then(function mySucces(response) {
                self.loggedInUser = response.data.loggedInUser;
                self.isAdmin = self.loggedInUser.isAdmin;
                $rootScope.loggedInUserName = self.loggedInUser.name;
                resolve('Success');
            }, function myError(response) {
                alert(response.statusText);
                reject('Error');
            });
        });
    }

    function showSplashScreen() {
        if (dataService.shouldShowSplashScreen()) {
            dataService.disableSplashScreen();

            $mdDialog.show({
                templateUrl: 'directives/splashscreen/splashscreen.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false
            })
                .then(function(answer) {
                }, function() {
                });
        }
    }

    self.showSplashScreen = showSplashScreen;

    // self.showSplashScreen();

    function updateUsersVisibility(status) {
        self.showUsers = status;
        self.showDataGrid = !status;
        self.showCaseTypes = false;
    }

    function updateCaseTypesVisibility(status) {
        self.showCaseTypes = status;
        self.showUsers = false;
        self.showDataGrid = !status;
    }

    function openMenu($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };

    self.gridOptions = {
        enableFiltering: true,
        showGridFooter: true,
        enableGridMenu: true,
        enableSelectAll: true,
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
            { name: 'id', field: 'id', width: "*", visible: false },
            { name: 'Expert First Name', field: 'Expert_FName', width: "*" },
            { name: 'Expert Last Name', field: 'Expert_LName', width: "*" },
            { name: 'Title', field: 'suffix', width: "*" },
            { name: 'Plt/Def', field: 'plt/def', width: "*" },
            { name: 'Lawyer F.Name', field: 'Lawyer_FName', width: "*", visible: false },
            { name: 'Lawyer L.Name', field: 'Lawyer_LName', width: "*", visible: false },
            { name: 'jurisdiction', field: 'jurisdiction', width: "*" },
            { name: 'Practice Area', field: 'practiceArea', width: "*" },
            { name: 'Date Taken', field: 'dateTaken', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'', width: "*" },
            { name: 'Frmt', field: 'format', visible: false, width: "*" },
            { name: 'Status', field: 'status', width: "*" },
            { name: 'Case Type', field: 'caseType', width: "*" },
            { name: 'Lawyer Comments', field: 'lawyerComments', width: "*" },
            { name: 'Approval Comments', field: 'approverComments', visible: false, width: "*" },
            { name: 'Approver', field: 'approver', visible: false, width: "*" },
            { name: 'Approved On', field: 'approvedOn', visible: false, width: "*" },
            { name: 'Tag1', field: 'tag1', visible: false, width: "*" },
            { name: 'Tag2', field: 'tag2', visible: false, width: "*" },
            { name: 'Tag3', field: 'tag3', visible: false, width: "*" },
            { name: 'Tag4', field: 'tag4', visible: false, width: "*" },
            { name: 'Tag5', field: 'tag5', visible: false, width: "*" },
            // { name: 'File Title', field: 'depositionFileTitle', visible: false, width: "*" },
            {
                name: 'Depo Download',
                cellTemplate: '<md-button ng-href="/download/{{row.entity.id}}" ' +
                'target="_self" class="md-fab md-mini md-primary" aria-label="Download"> ' +
                '<md-icon md-svg-src="assets/img/icons/ic_file_download_white_24px.svg"></md-icon> ' +
                '<md-tooltip>Download Deposition File</md-tooltip> </md-button>',
                width: "*"
            },
            {
                name: 'Supporting Files',
                cellTemplate: '<md-button ng-if="row.entity.isSupportingFilePresent == 1" ng-href="/downloadSupportingFiles/{{row.entity.id}}" ' +
                'target="_self" class="md-fab md-mini md-primary" aria-label="Download Supporting Files"> ' +
                '<md-icon md-svg-src="assets/img/icons/ic_file_download_white_24px.svg"></md-icon> ' +
                '<md-tooltip>Download Supporting Files</md-tooltip> </md-button>',
                width: "*"
            },
            {
                name: 'Approve',
                cellTemplate: '<md-button class="md-fab md-mini md-primary" ' +
                'aria-label="Approve" ng-click="grid.appScope.approveSelectedDocument($event, row.entity.id)"' +
                'ng-if="row.entity.status==\'Pending\'"> ' +
                '<md-icon md-svg-src="assets/img/icons/ic_spellcheck_white_24px.svg"></md-icon> ' +
                '<md-tooltip>Approve Document</md-tooltip>' +
                ' </md-button>',
                width: "*"
            }
        ],
        rowHeight: 50,
        data: self.myData,
        enableColumnMenus: false
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

    function showAdvanced(ev) {
        // dataService.setDocumentEditMode(false);

        $mdDialog.show({
            controller: 'uploadDocumentCtrl',
            templateUrl: 'directives/upload-document/upload-document.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals:
            { inputData: null },
            clickOutsideToClose: false
        })
            .then(function(answer) {
            }, function() {
            });
    }

    self.showAdvanced = showAdvanced;

    function searchDocumentsByTags() {
        $http({
            url: '/searchDocuments',
            method: "GET",
            params: { isAdmin: self.isAdmin, loggedInUser: self.loggedInUser, tags: self.tags }
        }).success(function(data) {
            self.myData = data[0];
            self.gridOptions.data = self.myData;
            self.isDataLoading = false;
        }).error(function() {
            alert('error');
            self.isDataLoading = false;
        });
    }

    function getAllDocuments() {
        self.isAdminLogin().then(function(greeting) {
            $http({
                url: '/getAllDocuments',
                method: "GET",
                params: { isAdmin: self.isAdmin, tags: self.tags }
            }).success(function(data) {
                self.myData = data[0];
                self.gridOptions.data = self.myData;
                self.isDataLoading = false;

            }).error(function() {
                alert('error');
                self.isDataLoading = false;
            });
        }, function(reason) {
            alert('Failed: ' + reason);
        });
    }

    $scope.approveSelectedDocument = function(ev, docId) {
        dataService.setSelectedDocId(docId);
        $mdDialog.show({
            templateUrl: 'directives/approve-document/approve-document.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            controller: 'approveDocumentCtrl'
        })
            .then(function() {
                self.getAllDocuments();
            }, function() {
            });

    }

    function setLoggedInUser() {
        self.loggedInUser = loginService.get();
        self.isAdmin = loginService.isAdmin();

        var pos = self.gridOptions.columnDefs.map(function(e) { return e.name; }).indexOf('Approve');

        if (self.isAdmin === 0) {
            self.gridOptions.columnDefs.splice(pos);
            self.gridOptions.columnDefs[11].visible = false;
        }
        //self.gridOptions.columnDefs[pos].visible = self.isAdmin === 1 ? true:false;

    }


    function updateDocumentTags() {
        $http.post('/updateDocumentTags', { docId: self.selectedDocId, tags: self.selectedDocumentTags })
            .success(function(user) {
                self.getAllDocuments();
                toastr.success("Tags updated...");

            })
            .error(function() {
                alert('error');
            });
    }
    function sampleAction(name, ev) {

        var confirm = $mdDialog.confirm()
            .title('Action')
            .content('You triggered the "' + name + '" action')
            .ariaLabel('Lucky day')
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm);

    };
    function showRejectedDocuments() {
        self.showRejected = !self.showRejected;
        if (self.showRejected) {
            $http({
                url: '/getAllRejectedDocument',
                method: "GET"
            }).success(function(data) {
                self.myData = data[0];
                self.gridOptions.data = self.myData;
                self.isDataLoading = false;
            }).error(function() {
                alert('error');
            });
        }
        else {
            self.getAllDocuments();
        }

    }

    function refreshDocuments() {
        self.isDataLoading = true;
        self.getAllDocuments();
    }
    var unbind = $rootScope.$on('refreshGridDataEvent', function() {
        self.getAllDocuments();
    });

    function editSelectedDocument(event) {
        if (self.selectedDocId < 0)
            return;
        // var data = self.myData[self.selectedDocId - 1];

        var data = self.myData.filter(function(obj) {
            return obj.id == self.selectedDocId;
        })[0];

        // console.log(selectedDocument);

        dataService.setDocumentEditMode(true);
        dataService.setSelectedDocument(data);

        $location.url('/upload-document');


        // $mdDialog.show({
        //     controller: 'uploadDocumentCtrl',
        //     templateUrl: 'directives/upload-document/upload-document.html',
        //     parent: angular.element(document.body),
        //     targetEvent: event,
        //     clickOutsideToClose: false
        // })
        //     .then(function (answer) {
        //     }, function () {
        //     });
    }

    $rootScope.$on('$destroy', unbind);

    self.getAllDocuments = getAllDocuments;
    self.searchDocumentsByTags = searchDocumentsByTags;
    self.setLoggedInUser = setLoggedInUser;
    self.updateDocumentTags = updateDocumentTags;
    self.refreshDocuments = refreshDocuments;
    self.showRejectedDocuments = showRejectedDocuments;
    self.editSelectedDocument = editSelectedDocument;


    self.setLoggedInUser();
    self.getAllDocuments();

    self.advImage = null;
    // self.allImages = ['lawyers-img/main.jpg', 'lawyers-img/6.jpg', 'lawyers-img/lawyer.jpg'];
    self.adsImages = [];
    self.advCount = 0;
    self.getAllAdsImages = getAllAdsImages;
    self.getFirstAdImage = getFirstAdImage;
    self.getSecondAdImage = getSecondAdImage;
    
    self.firstAdFile = null;
    self.secondAdFile = null;
    
    function getAllAdsImages() {
        $http.get('/getAdvertisements').success(function(data) {
            self.adsImages = data;
        }).error(function() {
            alert('error');
        });
    }

    function getFirstAdImage() {
        $http.get('/getFirstAdImage').success(function(data) {
            self.firstAdFile = data[0];
        }).error(function() {
            alert('error');
        });
    }
    function getSecondAdImage() {
        $http.get('/getSecondAdImage').success(function(data) {
            self.secondAdFile = data[0];
        }).error(function() {
            alert('error');
        });
    }

    self.getFirstAdImage();
    self.getSecondAdImage();
    self.getAllAdsImages();

    $interval(function() {
        if (self.advCount === self.adsImages.length) {
            self.advCount = 0;
        }
        self.advImage = self.adsImages[self.advCount];
        self.advCount++;
    }, 6000);



    // slides.push({ image: 'lawyers-img/6.jpg' });
    // slides.push({ image: 'lawyers-img/lawyer.jpg' });
});