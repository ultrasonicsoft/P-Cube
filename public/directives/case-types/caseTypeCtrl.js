'use strict';
mainApp.controller('CaseTypesCtrl', function ($mdDialog, $http, $filter, $q, toastr) {
    var self = this;

    function getCaseTypes() {
        $http.get('/getCaseTypes').success(function (data) {
            self.caseTypes = data[0];
        }).error(function () {
            alert('error');
        });
    };
    
    function filterCaseType(caseType) {
        return caseType.isDeleted !== true;
    };

    // mark user as deleted
    function deleteCaseType(id) {
        var filtered = $filter('filter')(self.caseTypes, { id: id });
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };
    
    // add user
    function addCaseType() {
        self.caseTypes.push({
            id: self.caseTypes.length + 1,
            caseType: '',
            isNew: true
        });
    };
    
    // cancel all changes
    function cancel() {
        for (var i = self.caseTypes.length; i--;) {
            var caseType = self.caseTypes[i];
            // undelete
            if (caseType.isDeleted) {
                delete caseType.isDeleted;
            }
            // remove new 
            if (caseType.isNew) {
                self.caseTypes.splice(i, 1);
            }
        };
    };
    
    // save edits
    function saveTable() {
        var results = [];
        for (var i = self.caseTypes.length; i--;) {
            var caseType = self.caseTypes[i];
            // actually delete user
            if (caseType.isDeleted) {
                self.caseTypes.splice(i, 1);
                $http.post('/deleteCaseType', { id: caseType.id });
            }
            // mark as not new 
            else if (caseType.isNew) {
                // send on server
                results.push($http.post('/saveCaseType', { caseType: caseType }));
                caseType.isNew = false;
            } else {
                //update rows
                results.push($http.post('/updateCaseType', { caseType: caseType }));
            }
        }
        
        return $q.all(results);
    };
    
    self.getCaseTypes = getCaseTypes;
    self.deleteCaseType = deleteCaseType;
    self.addCaseType = addCaseType;
    self.cancel = cancel;
    self.saveTable = saveTable;
    self.filterCaseType = filterCaseType ;
    
    self.getCaseTypes();
});