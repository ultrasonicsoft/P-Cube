'use strict';
var dataTale = null;
mainApp.controller('CarouselCtrl', function($rootScope, $scope) {
    if (!dataTale) {
        dataTale = $('#example').DataTable({
            "scrollX": true
        });
    }
});