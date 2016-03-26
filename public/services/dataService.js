angular.module('myApp').service('dataService', function () {
    var selectedDocId = -1;
    var selectedDocument;
    var isDocumentEditMode = false;
    var showSplashScreen = true;

    function shouldShowSplashScreen() {
        return showSplashScreen;
    }
    function disableSplashScreen() {
        showSplashScreen = false;
    }

    function setSelectedDocId(docId) {
        selectedDocId = docId;
    }
    function getSelectedDocId() {
        return selectedDocId;
    }

    function setSelectedDocument(doc) {
        selectedDocument = doc;
    }

    function getSelectedDocument() {
        return selectedDocument;
    }

    function setDocumentEditMode(status) {
        isDocumentEditMode = status;
    }
    function getDocumentEditMode() {
        return isDocumentEditMode;
    }

    return {
        setSelectedDocId: setSelectedDocId,
        getSelectedDocId: getSelectedDocId,

        setSelectedDocument: setSelectedDocument,
        getSelectedDocument: getSelectedDocument,

        setDocumentEditMode: setDocumentEditMode,
        getDocumentEditMode: getDocumentEditMode,

        shouldShowSplashScreen: shouldShowSplashScreen,
        disableSplashScreen: disableSplashScreen
    }

});