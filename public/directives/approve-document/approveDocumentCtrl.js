'use strict';
mainApp.controller('approveDocumentCtrl', function ($mdDialog, $http, $rootScope, loginService, dataService, toastr) {
    var self = this;
    
    function approveDocument(decision) {
       var selectedDocId = dataService.getSelectedDocId();

        $http.post('/approveDocument', { docId: selectedDocId, userId: loginService.getId(), decision: decision, approverComments: self.approverComments })
            .success(function (user) {
                if(decision)
                toastr.success('Document approved!');
            else
                toastr.success('Document rejected!');
            $rootScope.$emit("refreshGridDataEvent");
        })
            .error(function (response) {
            toastr.error('Failed to approve document. Error: ' + response.status + ': ' + response.data);

        });
        self.cancel();
    }
    
    function cancel() {
        $mdDialog.cancel();
    };
    

    self.approveDocument = approveDocument;
    self.cancel = cancel;

});