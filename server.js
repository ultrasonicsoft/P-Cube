var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var js2xmlparser = require("js2xmlparser");
var fs = require('fs');
var util = require('util');
var dateFormat = require('dateformat');
var multipart = require('connect-multiparty');
var url = require('url');
var https = require('https');
var querystring = require('querystring');
var process = require('process');
var q = require('q');
var parseString = require('xml2js').parseString;
var archiver = require('archiver');

//var multiparty = require('multiparty');

// Start express application
var app = express();

/*MySql connection*/
var connection = require('express-myconnection'),
    mysql = require('mysql');

//Database connection details
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lawyer_doc_store'
});
connection.query('USE lawyer_doc_store');

// all environments

app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'securedsession' }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.use(multipart({ uploadDir: __dirname }));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


//==================================================================
// Define the strategy to be used by PassportJS
passport.use(new LocalStrategy(
    function(username, password, done) {

        var query = "SELECT * FROM users where UserName = '" + username + "' and Password = '" + password + "'";

        connection.query(query, function(err, rows) {
            if (err)
                console.log(err);
            if (!rows.length) {

                doOctlaLogin(username, password).then(function(user) {
                    if (user) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, { message: 'No user found.' });
                    }
                });

                // doOctlaLogin(username, password).then(function (gotoUrl) {
                //     if (gotoUrl) {
                //         console.log('sending gotoUrl to client: ' + gotoUrl);
                //         return done(null, { name: userDetails.UserName, isAdmin: userDetails.IsAdmin, userId: userDetails.Id, gotoUrl: gotoUrl });
                //     }
                //     else
                //         return done(null, false, { message: 'No user found.' });
                // });
                //return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            else if (!(rows[0].Password == password)) {
                //return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                return done(null, false, { message: 'Oops! Wrong password.' });
            }
            else {
                // all is well, return successful user

                //return done(null, rows[0]);
                var userDetails = rows[0];
                return done(null, { name: userDetails.UserName, isAdmin: userDetails.IsAdmin, userId: userDetails.Id, gotoUrl: '' });
            }
        });

        //if (username === "admin" && password === "admin") // stupid example
        //    return done(null, { name: "admin" });

        //return done(null, false, { message: 'Incorrect username.' });
    }
));


// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next) {
    // if (!req.isAuthenticated())
    //     res.send(401);
    // else
        next();
};
//==================================================================
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});


// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
    console.log('checking if user is logged in: ' + req.user);
    res.send(req.isAuthenticated() ? req.user : '0');
});


// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
    if (req.user) {
        req.session.user = req.user;
    }
    res.send(req.user);
});

// route to log out
app.post('/logout', function(req, res) {
    req.logOut();
    res.send(200);
});

//==================================================================
// routes
app.get('/', function(req, res) {
    res.render('index');
});


app.get('/loggedInUser', auth, function(req, res) {
    res.send({ loggedInUser: req.user });
});

app.get('/getAllDocuments', auth, function(req, res) {
    var queryData = url.parse(req.url, true).query;
    var isAdmin = queryData.isAdmin;
    if (isAdmin == 1 || isAdmin == true)
        executeSqlRequest(req, res, 'call getAllDocuments(0,0);');
    else {
        var query = 'call getAllDocuments(1,' + req.user.userId + ');'
        executeSqlRequest(req, res, query);
    }
});

app.get('/getAllApplications', auth, function(req, res) {
   var data = [];
   var application = {
       userName:"a1",
       comments:"a2",
       applicationCountry:"a3",
       applicationServiceCenter:"a4",
       applicationProcess:"a5",
       applicationType:"a6",
       passportCategory:"a7",
       BLSReceiptNumber:"a8",
       applicationAcceptedByBLS:"a9",
       applicationProcessedOnDate:"a10",
       applicationProcessedAndSubmittedToConsulate:"a11",
       passportReceivedAtBLSCenter:"a12",
       passportHandedOverToApplicant:"a13",
       passportDispatchedToApplicant:"a14",
       applicationStatus:"a15",
       currentResidenceCountry:"a16",
       currentResidenceState:"a17",
       totalProcessingTime:"a18",
       daysElapsed:"a19",
       caseAddedToTheTracker:"a20",
       lastUpdated:"a21"
   }
   data.push(application);
   application = {
       userName:"b1",
       comments:"b2",
       applicationCountry:"b3",
       applicationServiceCenter:"b4",
       applicationProcess:"b5",
       applicationType:"b6",
       passportCategory:"b7",
       BLSReceiptNumber:"b8",
       applicationAcceptedByBLS:"b9",
       applicationProcessedOnDate:"b10",
       applicationProcessedAndSubmittedToConsulate:"b11",
       passportReceivedAtBLSCenter:"b12",
       passportHandedOverToApplicant:"b13",
       passportDispatchedToApplicant:"b14",
       applicationStatus:"b15",
       currentResidenceCountry:"b16",
       currentResidenceState:"b17",
       totalProcessingTime:"b18",
       daysElapsed:"b19",
       caseAddedToTheTracker:"b20",
       lastUpdated:"b21"
   }
   data.push(application);
   res.send(data);
});

function replaceAll(find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
}

function executeSqlRequest(req, res, query) {
    connection.query(query, function(err, rows) {
        //  console.log(rows);

        if (err) // error connecting to database
            console.log(err);
        if (rows.length) { // user exists
            res.send(rows);
        }
    });
}
