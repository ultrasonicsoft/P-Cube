'use strict';
mainApp.controller('adsManagerCtrl', function($mdDialog, $http, $rootScope, $scope, Upload, $location, loginService, $timeout, toastr, dataService) {
    var self = this;
    self.adsImages = [];
    self.files = [];


    self.getAllAdsImages = getAllAdsImages;
    self.getFirstAdImage = getFirstAdImage;
    self.getSecondAdImage = getSecondAdImage;

    self.uploadFirstAdFile = uploadFirstAdFile;
    self.uploadSecondAdFile = uploadSecondAdFile;
    self.uploadFiles = uploadFiles;

    self.firstAdFile = null;
    self.secondAdFile = null;

    self.uploadAdvertisements = uploadAdvertisements;
    self.removeAdvImage = removeAdvImage;

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

    function getAllAdsImages() {
        $http.get('/getAdvertisements').success(function(data) {
            self.adsImages = data;
            self.files = [];
        }).error(function() {
            alert('error');
        });
    }

    function uploadFirstAdFile(files) {
        self.firstAdFile = files;
    };
    function uploadSecondAdFile(files) {
        self.secondAdFile = files;
    };

    function uploadFiles(files) {
        self.files = files;
    };

    function uploadAdvertisements() {
        console.log(self.files);

        Upload.upload({
            url: '/uploadAdvertisements',
            data: {
                firstAd: self.firstAdFile[0], secondAd: self.secondAdFile[0], ads: self.files
            }
        }).then(function(response) {
            $timeout(function() {
                toastr.success('Advertisement uploaded successfully!');
                self.getAllAdsImages();
            });
        }, function(response) {
            if (response.status > 0) {
                toastr.error('Failed to upload document. Error: ' + response.status + ': ' + response.data);

            }
        }, function(evt) {
            $scope.progress =
                Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });

    }

    function removeAdvImage(advImage) {
        console.log(advImage);
        var fileName = advImage.split('/')[1];

        $http.post('/deleteAdvImage', { fileName: fileName })
            .success(function(user) {
                toastr.success('Advertisement image deleted!');
                self.getAllAdsImages();
            })
            .error(function(error) {
                toastr.error('Failed to delete advertisement. Error: ' + error);
            });
    }
    self.getAllAdsImages();
    self.getFirstAdImage();
    self.getSecondAdImage();
});