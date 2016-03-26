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
    if (!req.isAuthenticated())
        res.send(401);
    else
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

// route to log in
// app.post('/octlaLogin', passport.authenticate('local'), function (req, res) {
//     doOctlaLogin("jdickinson", "testuser8");
//     var user= { name: "jdickinson", isAdmin: false, userId: 1, gotoUrl: 'http://www.google.com' };
//     req.logIn(user, function (err) {
//         if (!err) {
//             res.send(user)
//         } else {
//             console.log('error during login');
//             
//             //handle error
//         }
//     })
// });

app.post('/octlaLogin', passport.authenticate('local'), function(req, res) {
    res.send(req.user);

    //     // app.post('/octlaLogin', function (req, res, next) {
    //     var userName = req.body.username;
    //     var password = req.body.password;
    // 
    //     passport.authenticate('local', function (err, user, info) {
    //         if (err) {
    //             return next(err);
    //         }
    //         if (!user) {
    // 
    //             doOctlaLogin(req, res, userName, password).then(function (user) {
    //                 // var user = { name: userName, isAdmin: false, userId: 1, gotoUrl: gotoUrl };
    //                 req.user = user;
    //                 return res.send(user);
    //             });
    //             // return res.redirect('/login');
    //         }
    //         // req.logIn(user, function (err) {
    //         //     if (err) {
    //         //         return next(err);
    //         //     }
    //         //     return res.redirect('/users/' + user.username);
    //         // });
    //     })(req, res, next);
});

function doOctlaLogin(username, password) {
    var deferred = q.defer();

    var newSessionPostData = '<YourMembership><Version>2.03</Version><ApiKey>62718323-2B86-48F3-8F61-1B0AB60943E8</ApiKey><CallID>001</CallID><Origin></Origin><Call Method="Session.Create" /></YourMembership>';
    executeYMRequest(newSessionPostData).then(function(val) {

        parseString(val.toString(), function(err, result) {
            console.log('Error code: ' + result.YourMembership_Response.ErrCode[0]);
            var sessionId = result.YourMembership_Response["Session.Create"][0].SessionID[0];
            console.log('Session ID: ' + sessionId);

            octlaAuthenticate(sessionId, username, password).then(function(user) {
                deferred.resolve(user);
            });

            // doSSO(sessionId, username, password).then(function (gotoUrl) {
            //     deferred.resolve(gotoUrl);
            // });
        });
    });
    return deferred.promise;
}

function octlaAuthenticate(sessionId, username, password) {
    var deferred = q.defer();

    var callId = Math.random() * 25;

    var authRequest = '<YourMembership><Version>2.03</Version><ApiKey>62718323-2B86-48F3-8F61-1B0AB60943E8</ApiKey><CallID>'
        + callId + '</CallID><SessionID>' + sessionId + '</SessionID><Origin></Origin><Call Method=\"Auth.Authenticate\"><Username>'
        + username + '</Username><Password>' + password + '</Password></Call></YourMembership>';
    console.log('SSO Request: ' + authRequest);

    executeYMRequest(authRequest).then(function(val) {
        parseString(val.toString(), function(err, result) {
            console.log('Error code: ' + result.YourMembership_Response.ErrCode[0]);
            console.log('Response: ' + result);
            if (result.YourMembership_Response["Auth.Authenticate"] && result.YourMembership_Response["Auth.Authenticate"][0]) {
                // var ID = result.YourMembership_Response["Auth.Authenticate"][0].ID[0];
                // var websiteId = result.YourMembership_Response["Auth.Authenticate"][0].WebsiteID[0];

                var user = { name: username, isAdmin: 0, userId: 1, gotoUrl: "" };
                deferred.resolve(user);
            }
            else {
                deferred.resolve(null);
            }
        });
    });
    return deferred.promise;
}

function doSSO(sessionId, username, password) {
    var deferred = q.defer();

    var callId = Math.random() * 25;

    var ssoPostData = '<YourMembership><Version>2.03</Version><ApiKey>62718323-2B86-48F3-8F61-1B0AB60943E8</ApiKey><CallID>'
        + callId + '</CallID><SessionID>' + sessionId + '</SessionID><Origin></Origin><Call Method=\"Auth.CreateToken\"><RetUrl>http://www.octla.org/</RetUrl><Username>'
        + username + '</Username><Password>' + password + '</Password><Persist>True</Persist></Call></YourMembership>';
    console.log('SSO Request: ' + ssoPostData);

    executeYMRequest(ssoPostData).then(function(val) {
        parseString(val.toString(), function(err, result) {
            console.log('Error code: ' + result.YourMembership_Response.ErrCode[0]);
            console.log('Response: ' + result);
            var authToken = result.YourMembership_Response["Auth.CreateToken"][0].AuthToken[0];
            var gotoUrl = result.YourMembership_Response["Auth.CreateToken"][0].GoToUrl[0];
            deferred.resolve(gotoUrl);
        });
    });
    return deferred.promise;
}


function executeYMRequest(postData) {
    var deferred = q.defer();
    var response = '';

    var options = {
        hostname: 'api.yourmembership.com',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    var req = https.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            response += chunk;
        });
        res.on('end', function() {
            console.log('No more data in response.')
            deferred.resolve(response);
        })
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();
    return deferred.promise;
}

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

app.get('/getUserDetails/:userId', auth, function(req, res) {
    console.log('DocId: ' + req.params.userId);
    var query = 'call getUserDetails(' + req.params.userId + ');';
    executeSqlRequest(req, res, query);
});

app.get('/getAllRejectedDocument', auth, function(req, res) {
    executeSqlRequest(req, res, 'call getAllDocuments(-1, 0);');
});

app.get('/getApprovedDocuments', auth, function(req, res) {
    executeSqlRequest(req, res, 'call getAllDocuments(1,0);');
});

app.get('/getAllCaseTypes', auth, function(req, res) {
    executeSqlRequest(req, res, 'call getAllCaseTypes();');
});

//download file
app.get('/download/:docId', auth, function(req, res) {
    console.log('DocId: ' + req.params.docId);
    //TODO: fetch file path from db based on DocId and send it
    var query = 'call getDownloadFilePath(' + req.params.docId + ');';
    var downloadFileName = "";
    connection.query(query, function(err, rows) {
        //  console.log(rows);
        if (err) {
            console.log(err);
            res.send(400);
        }
        if (rows.length) {
            downloadFileName = rows[0][0].depositionFileTitle;
            var filepath = path.normalize(__dirname + '/Uploads/' + req.params.docId.toString() + '/');
            filepath += downloadFileName;
            console.log(filepath);
            res.download(filepath);
        }
    });
});

app.get('/downloadSupportingFiles/:docId', auth, function(req, res) {
    var docId = req.params.docId.toString();
    var filepath = path.normalize(__dirname + '/Uploads/' + docId + '/' + docId + '.zip');
    console.log('Downloading supporting file: ' + filepath);
    res.download(filepath);
});


//Search documents by tags
app.get('/searchDocuments', auth, function(req, res) {
    console.log('search request: ' + req.url);
    var queryData = url.parse(req.url, true).query;
    console.log('search queryData: ' + queryData);

    var tag1;
    var tag2;
    var tag3;
    var tag4;
    var tag5;
    var isAdmin = queryData.isAdmin;

    console.log('search queryData.tags: ' + queryData);

    if (queryData.tags === undefined) {
        if (isAdmin == 1) {
            console.log('executing with as admin : call getAllDocuments(0,0);');
            executeSqlRequest(req, res, 'call getAllDocuments(0,0);');
        }
        else {
            var query = 'call getAllDocuments(1,' + req.user.userId + ');'
            console.log('executing with as non admin : ' + query);
            executeSqlRequest(req, res, query);
        }
    } else {
        if (queryData.tags != undefined && queryData.tags.constructor === Array) {
            tag1 = queryData.tags[0];
            tag2 = queryData.tags[1];
            tag3 = queryData.tags[2];
            tag4 = queryData.tags[3];
            tag5 = queryData.tags[4];
        } else {
            tag1 = queryData.tags;
        }

        var query;
        console.log(queryData);
        if (isAdmin == 1) {
            query = util.format('call searchDocumentsByTags(0,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\');', tag1 || '', tag2 || '', tag3 || '', tag4 || '', tag5 || '');

        }
        else
            query = util.format('call searchDocumentsByTags(1,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\');', tag1 || '', tag2 || '', tag3 || '', tag4 || '', tag5 || '');

        console.log('search sp :' + query);

        connection.query(query, function(err, rows) {
            if (err) // error connecting to database
            {
                console.log(err);
                res.send(400);
            }
            else {
                console.log('search document result: ' + rows);
                res.send(rows);
            }
        });
    }

});

app.get('/getUsers', auth, function(req, res) {
    executeSqlRequest(req, res, 'call getUsers();');
});

app.get('/getAdvertisements', auth, function(req, res) {
    // var allImages = ['lawyers-img/main.jpg', 'lawyers-img/6.jpg', 'lawyers-img/lawyer.jpg'];
    var allImages = [];

    var currentPath = path.join(__dirname, 'public/lawyers-img');

    fs.readdir(currentPath, function(err, items) {
        console.log(items);

        for (var i = 0; i < items.length; i++) {
            var fullFilePath = path.join(__dirname, 'public/lawyers-img/') + items[i]; 
            console.log(fullFilePath);
            
            if (fs.lstatSync(fullFilePath).isFile()) {
                allImages.push('lawyers-img/' + items[i]);
            }
        }
        res.send(allImages);
    });

});

app.get('/getFirstAdImage', auth, function(req, res) {
    var allImages = [];

    var currentPath = path.join(__dirname, 'public/lawyers-img/firstAd');

    fs.readdir(currentPath, function(err, items) {
        console.log(items);

        for (var i = 0; i < items.length; i++) {
            var fullFilePath = path.join(__dirname, 'public/lawyers-img/firstAd/') + items[i]; 
            console.log(fullFilePath);
            
            if (fs.lstatSync(fullFilePath).isFile()) {
                allImages.push('lawyers-img/firstAd/' + items[i]);
            }
        }
        res.send(allImages);
    });
});

app.get('/getSecondAdImage', auth, function(req, res) {
    var allImages = [];

    var currentPath = path.join(__dirname, 'public/lawyers-img/secondAd');

    fs.readdir(currentPath, function(err, items) {
        console.log(items);

        for (var i = 0; i < items.length; i++) {
            var fullFilePath = path.join(__dirname, 'public/lawyers-img/secondAd/') + items[i]; 
            console.log(fullFilePath);
            
            if (fs.lstatSync(fullFilePath).isFile()) {
                allImages.push('lawyers-img/secondAd/' + items[i]);
            }
        }
        res.send(allImages);
    });
});

app.get('/getCaseTypes', auth, function(req, res) {
    executeSqlRequest(req, res, 'call getCaseTypes();');
});

app.get('/getUploadedHistory', auth, function(req, res) {
    executeSqlRequest(req, res, 'call getUploadedHistory();');
});

app.get('/getTotalDocumentsUploadedByUser/:userId', auth, function(req, res) {
    var userId = req.params.userId.toString();
    var query = 'select count(*) as TotalDocuments from lawyer_doc_store.documents where submitterId = ' + userId + ';'
    executeSqlRequest(req, res, query);
});

app.get('/getTotalDocumentsUploadedReport', auth, function(req, res) {
    executeSqlRequest(req, res, 'call getTotalDocumentsUploadedReport();');
});

app.post('/saveUser', auth, function(req, res) {

    var query = util.format('call saveUser(\'%s\',\'%s\',%d);',
        req.body.user.userName, req.body.user.password, req.body.user.isAdmin);

    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

app.post('/updateUserDetails', auth, function(req, res) {
    var user = req.body.user;
    var query = util.format('call updateUserDetails(%d,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\');',
        user.Id, user.UserName, user.Password, user.firstName, user.lastName, user.address, user.address2, user.city, user.state, user.postalCode, user.phone);

    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

app.post('/saveCaseType', auth, function(req, res) {

    var query = util.format('call saveCaseType(\'%s\');',
        req.body.caseType.caseType);

    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

app.post('/updateUser', auth, function(req, res) {

    var query = util.format('call updateUser(%d,\'%s\',\'%s\',%d);',
        req.body.user.id, req.body.user.userName, req.body.user.password, req.body.user.isAdmin);

    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

app.post('/updateCaseType', auth, function(req, res) {

    var query = util.format('call updateCaseType(%d,\'%s\');',
        req.body.caseType.id, req.body.caseType.caseType);

    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

app.post('/deleteUser', auth, function(req, res) {

    var query = util.format('call deleteUser(%d);',
        req.body.id);

    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

app.post('/deleteCaseType', auth, function(req, res) {

    var query = util.format('call deleteCaseType(%d);',
        req.body.id);

    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

app.post('/uploadNewDocument', function(req, res, next) {

    if (req.files.depositionFile) {
        var newDoc = req.body.newDocument;
        uploadNewDocument(newDoc, req, req.user.userId, res, "", "", "");
    }



    //     if (req.files && req.files.files.length) {
    // 
    //         var fileInformation = [];
    //         var newFileName = null;
    //         var fileExt = null;
    // 
    //         req.files.files.forEach(function (file) {
    //             saveFileToServer(file);
    // 
    //             newFileName = path.join(__dirname, 'Uploads', file.name);
    //             fileExt = path.extname(file.name);
    // 
    //             fileInformation.push({ newFileName: newFileName, fileExt: fileExt, fileName: file.name })
    //         }, this);
    //         console.log('all files have been uploaded to server.');
    // 
    //         var newDoc = req.body.newDocument;
    //         uploadNewDocument(newDoc, req.user.userId, res, "", "", "");
    //     }
});

app.post('/uploadAdvertisements', function(req, res, next) {

    if (req.files.firstAd) {
        var pathToSave = path.join(__dirname, 'public/lawyers-img/firstAd');
        saveAdvertisementFileToServer(pathToSave, req.files.firstAd);
    }
    if (req.files.secondAd) {
        var pathToSave = path.join(__dirname, 'public/lawyers-img/secondAd');
        saveAdvertisementFileToServer(pathToSave, req.files.secondAd);
    }
    if (req.files.ads) {
        var pathToSave = path.join(__dirname, 'public/lawyers-img');

        req.files.ads.forEach(function(file) {
            saveAdvertisementFileToServer(pathToSave, file);
        }, this);
        console.log('all advertisement files have been uploaded to server.');
        res.send(200);
    }

});

app.post('/deleteAdvImage', function(req, res, next) {
    var fileName = path.join(__dirname, 'public/lawyers-img', req.body.fileName);
    fs.unlinkSync(fileName);
    res.send(200);
});

app.post('/saveMultipleDocuments', function(req, res, next) {
    if (req.files && req.files.files.length) {

        if (!fs.existsSync('./Uploads/TestFolder')) {
            fs.mkdirSync('./Uploads/TestFolder');
        }

        var newDoc = req.body.newDocument;
        req.files.files.forEach(function(file) {
            saveFileToServer(file, 'TestFolder');
        }, this);
        console.log('done');

        var outputPath = ".";
        var output = fs.createWriteStream('./Uploads/TestFolder.zip');
        var zipArchive = archiver('zip');

        output.on('close', function() {
            console.log('done with the zip', outputPath);
        });

        zipArchive.pipe(output);

        zipArchive.bulk([
            { src: ['**/*'], cwd: './Uploads/TestFolder', expand: true }
        ]);

        zipArchive.finalize(function(err, bytes) {

            if (err) {
                throw err;
            }

            console.log('done:', bytes);

        });

    }
});

function saveFileToServer(file, docId, isSupportingFiles) {
    var newFolderName = "";

    if (isSupportingFiles) {
        newFolderName = path.join(__dirname, 'Uploads', docId, "Supporting Files");
    }
    else {
        newFolderName = path.join(__dirname, 'Uploads', docId);
    }
    if (!fs.existsSync(newFolderName)) {
        fs.mkdirSync(newFolderName);
    }

    var newFileName = path.join(newFolderName, file.name);

    console.log(newFileName);

    var source = fs.createReadStream(file.path);
    var dest = fs.createWriteStream(newFileName);

    source.pipe(dest);
    source.on('end', function() {
        console.log(newFileName + ' file saved.');

    });
    source.on('error', function(err) { /* error */ });

    console.log(file.name);
    console.log(file.path); //tmp path (ie: /tmp/12345-xyaz.png)
    console.log(file.type);

    fs.unlink(file.path, function(err) {
        if (err) {
            throw err;
        }
        console.log('successfully deleted ' + file.name);
    });
}

function saveAdvertisementFileToServer(pathToSave, file) {
    var newFolderName = pathToSave;

    if (!fs.existsSync(newFolderName)) {
        fs.mkdirSync(newFolderName);
    }

    var newFileName = path.join(newFolderName, file.name);

    console.log(newFileName);

    var source = fs.createReadStream(file.path);
    var dest = fs.createWriteStream(newFileName);

    source.pipe(dest);
    source.on('end', function() {
        console.log(newFileName + ' file saved.');

    });
    source.on('error', function(err) { /* error */ });

    console.log(file.name);
    console.log(file.path); //tmp path (ie: /tmp/12345-xyaz.png)
    console.log(file.type);

    fs.unlink(file.path, function(err) {
        if (err) {
            throw err;
        }
        console.log('successfully deleted ' + file.name);
    });
}

app.post('/updateDocument', function(req, res, next) {
    var newDoc = req.body.newDocument;

    if (req.files) {
        var file = req.files.file;

        var newFileName = path.join(__dirname, 'Uploads', file.name);
        // var newFileName = path.join(__dirname, 'Uploads', newDoc.id.toString() + newDoc.format);
        console.log(newFileName);

        //var newFileName = __dirname + '\\Uploads\\' + file.name;
        var source = fs.createReadStream(file.path);
        var dest = fs.createWriteStream(newFileName);

        source.pipe(dest);
        source.on('end', function() { /* copied */ });
        source.on('error', function(err) { /* error */ });

        fs.unlink(file.path, function(err) {
            if (err) {
                res.send(400);
                throw err;
            }
            console.log('successfully deleted ' + file.name);

            updateDocument(newDoc, req.user.userId, res, dest.path, file.name);
        });
    }
    else {
        updateDocument(newDoc, req.user.userId, res, null, null);
    }
});

function updateDocument(newDoc, userId, res, filePath, fileName) {

    newDoc.dateTaken = dateFormat(newDoc.dateTaken, "yyyy-mm-dd");

    if (newDoc.tags === undefined)
        newDoc.tags = [];
    if (filePath) {
        filePath = replaceAll('\\', '\\\\', filePath);
    }

    var query = util.format('call updateDocument(%d,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\', %d,\'%s\',%d,\'%s\',\'%s\');',
        newDoc.id, newDoc.firstNameOfExpert, newDoc.lastNameOfExpert, newDoc.practiceArea, newDoc.dateTaken,
        newDoc.selectedOption, newDoc.firstNameOfLawyer, newDoc.lastNameOfLawyer,
        newDoc.jurisdiction, newDoc.lawyerComments,
        newDoc.tags[0], newDoc.tags[1], newDoc.tags[2], newDoc.tags[3], newDoc.tags[4],
        newDoc.selectedCaseType, newDoc.submitter, userId, filePath, fileName);

    console.log(query);

    connection.query(query, function(err, rows) {
        if (err) // error connecting to database
        {
            console.log(err);
            res.send(400);
        }
        else {
            console.log('Document updated successfully!');
            res.send(200);
        }
    });
}
app.post('/approveDocument', auth, function(req, res) {

    var query = 'call approveDocument(' + req.body.docId + ', ' + req.body.userId + ', ' + req.body.decision + ', \'' + req.body.approverComments + '\')';
    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

app.post('/updateDocumentTags', auth, function(req, res) {

    var updatedTags = req.body.tags;
    if (updatedTags === undefined)
        updatedTags = [];

    var query = util.format('call updateDocumentTags(%d,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\');',
        req.body.docId, updatedTags[0], updatedTags[1], updatedTags[2], updatedTags[3], updatedTags[4]);

    console.log(query);
    connection.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            res.send(400);
        }
        res.send(200);
    });
});

function uploadNewDocument(newDoc, req, userId, res, newFileName, fileExt, fileName) {

    console.log(newDoc.selectedSuffix);

    newDoc.dateTaken = dateFormat(newDoc.dateTaken, "yyyy-mm-dd");

    newFileName = replaceAll('\\', '\\\\', newFileName);
    console.log(newFileName);

    if (newDoc.tags === undefined)
        newDoc.tags = [];

    var query = util.format('call createNewDocument(\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\', %d,\'%s\',%d,\'%s\',\'%s\');',
        newDoc.firstNameOfExpert, newDoc.lastNameOfExpert, newDoc.practiceArea, newDoc.dateTaken,
        newDoc.selectedOption, newDoc.firstNameOfLawyer, newDoc.lastNameOfLawyer,
        newDoc.jurisdiction, fileExt, newFileName, newDoc.lawyerComments,
        newDoc.tags[0], newDoc.tags[1], newDoc.tags[2], newDoc.tags[3], newDoc.tags[4],
        newDoc.selectedCaseType, newDoc.submitter, userId, fileName, newDoc.selectedSuffix);

    console.log(query);

    connection.query(query, function(err, rows) {
        if (err) // error connecting to database
        {
            console.log(err);
            res.send(400);
        }
        else {
            console.log('New document saved into database successfully!');

            query = 'call getNewDocId();';

            connection.query(query, function(err, rows) {
                if (err) // error connecting to database
                {
                    console.log(err);
                    res.send(400);
                }
                else {
                    var newDocId = rows[0][0].NewDocId.toString();
                    console.log('New document Id: ' + newDocId);

                    saveFileToServer(req.files.depositionFile, newDocId, false);

                    var depostionFilePath = path.join(__dirname, 'Uploads', newDocId, req.files.depositionFile.name);
                    depostionFilePath = replaceAll('\\', '\\\\', depostionFilePath);

                    if (req.files && req.files.supportingFiles && req.files.supportingFiles.length) {

                        var fileInformation = [];
                        var newFileName = null;
                        var fileExt = null;

                        req.files.supportingFiles.forEach(function(file) {
                            saveFileToServer(file, newDocId, true);

                            newFileName = path.join(__dirname, 'Uploads', file.name);
                            fileExt = path.extname(file.name);

                            fileInformation.push({ newFileName: newFileName, fileExt: fileExt, fileName: file.name })
                        }, this);

                        console.log('all files have been uploaded to server.');
                        var supportingDocFolder = path.join(__dirname, 'Uploads', newDocId, 'Supporting Files');
                        var zipFileName = path.join(__dirname, 'Uploads', newDocId, newDocId + '.zip');
                        zipSupportingDocuments(supportingDocFolder, zipFileName);

                        zipFileName = replaceAll('\\', '\\\\', zipFileName);

                        query = util.format('call uploadFile(%d, \'%s\', \'%s\', \'%s\', \'%s\')',
                            newDocId, req.files.depositionFile.type, depostionFilePath, req.files.depositionFile.name, zipFileName);
                        console.log(query);

                        connection.query(query, function(err, rows) {
                            if (err) {
                                console.log(err);
                                res.send(400);
                            }
                            res.send(200);
                        });
                    }
                    else {

                        query = util.format('call uploadFile(%d, \'%s\', \'%s\', \'%s\', \'%s\')',
                            newDocId, req.files.depositionFile.type, depostionFilePath, req.files.depositionFile.name, '');
                        console.log(query);

                        connection.query(query, function(err, rows) {
                            if (err) {
                                console.log(err);
                                res.send(400);
                            }
                            res.send(200);
                        });
                    }


                }
            });
        }
    });

}

function zipSupportingDocuments(supportingDocFolder, zipFileName) {
    var outputPath = ".";
    var output = fs.createWriteStream(zipFileName);
    var zipArchive = archiver('zip');

    output.on('close', function() {
        console.log('done with the zip', outputPath);

        removeSupportingFiles(supportingDocFolder);
    });

    zipArchive.pipe(output);

    zipArchive.bulk([
        { src: ['**/*'], cwd: supportingDocFolder, expand: true }
    ]);

    zipArchive.finalize(function(err, bytes) {

        if (err) {
            throw err;
        }

        console.log('done:', bytes);

    });
}

function removeSupportingFiles(supportingDocFolder) {
    if (fs.existsSync(supportingDocFolder)) {
        fs.readdirSync(supportingDocFolder).forEach(function(file, index) {
            var curPath = supportingDocFolder + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                removeSupportingFiles(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(supportingDocFolder);
    }
}

function replaceAll(find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
}

function writeNewClientSectionInDB(sectionData, sectionName, rowName) {

    var xmlFilePathName = __dirname + "\\XmlData\\" + sectionName + ".xml";
    console.log(xmlFilePathName);

    // save xml to disk
    fs.writeFile(xmlFilePathName, sectionData, function(err) {
        if (err) throw err;
        console.log(sectionName + '.xml saved');

        // load general information xml into table
        var query = "LOAD XML LOCAL INFILE \"" + xmlFilePathName.replace(/\\/gi, "/") + "\" INTO TABLE  " + sectionName + " ROWS IDENTIFIED BY '" + rowName + "';";
        //var query = "LOAD XML LOCAL INFILE \"C:/Balram Data/Nodejs/AuthenticationAngularJS-master/XmlData/generalInformation.xml\" INTO TABLE generalinformation ROWS IDENTIFIED BY '<generalInformation>';";
        console.log(query);
        connection.query(query, function(err, rows) {
            if (err) // error connecting to database
            {
                console.log(err);
            }

            //}
        });
    });
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
