'use strict';
mainApp.controller('UsersCtrl', function ($mdDialog, $http, $filter, $q, toastr) {
    var self = this;

    //self.users = [
    //    { id: 1, userName: 'awesome user1', password: 'p1', isAdmin: true },
    //    { id: 2, userName: 'awesome user2', password: 'p2', isAdmin: false },
    //    { id: 3, userName: 'awesome user3', password: 'p3', isAdmin: true}
    //];
    
    function getUsers() {
        $http.get('/getUsers').success(function (data) {
            self.users = data[0];
        }).error(function () {
            alert('error');
        });
    };
    
    function filterUser(user) {
        return user.isDeleted !== true;
    };

    // mark user as deleted
    function deleteUser(id) {
        var filtered = $filter('filter')(self.users, { id: id });
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };
    
    // add user
    function addUser() {
        self.users.push({
            id: self.users.length + 1,
            userName: '',
            password: '',
            isAdmin: false,
            isNew: true
        });
    };
    
    // cancel all changes
    function cancel() {
        for (var i = self.users.length; i--;) {
            var user = self.users[i];
            // undelete
            if (user.isDeleted) {
                delete user.isDeleted;
            }
            // remove new 
            if (user.isNew) {
                self.users.splice(i, 1);
            }
        };
    };
    
    // save edits
    function saveTable() {
        var results = [];
        for (var i = self.users.length; i--;) {
            var user = self.users[i];
            // actually delete user
            if (user.isDeleted) {
                self.users.splice(i, 1);
                $http.post('/deleteUser', { id: user.id });
            }
            // mark as not new 
            else if (user.isNew) {
                // send on server
                results.push($http.post('/saveUser', { user: user }));
                user.isNew = false;
            } else {
                //update rows
                results.push($http.post('/updateUser', { user: user }));
            }
        }
        
        return $q.all(results);
    };
    
    self.getUsers = getUsers;
    self.deleteUser = deleteUser;
    self.addUser = addUser;
    self.cancel = cancel;
    self.saveTable = saveTable;
    self.filterUser = filterUser ;
    
    self.getUsers();
});