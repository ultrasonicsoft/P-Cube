angular.module('myApp').service('loginService', function () {
    var loggedInUser = {};
    
    function set(user) {
        loggedInUser = user;
    }
    function get() {
        return loggedInUser;
    }
    
    function isAdmin() {
        return loggedInUser.isAdmin;
    }
    function getId() {
        return loggedInUser.userId;
    }
    return {
        set: set,
        get: get,
        isAdmin: isAdmin,
        getId: getId
}

});