"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');

var fs = require("fs");

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var Password = require('./cs142password.js');
var Activity = require('./schema/activity.js');

var express = require('express');
var app = express();
app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            { name: 'user', collection: User },
            { name: 'photo', collection: Photo },
            { name: 'schemaInfo', collection: SchemaInfo }
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    //not logged in
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    //otherwise
    User.find({}, function (err, users) {
        if (err) {
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else {
            var userList = [];
            for (var user of users) {
                //extract user properties needed 
                var obj = {};
                obj._id = user._id;
                obj.first_name = user.first_name;
                obj.last_name = user.last_name;
                obj.recent_activity = user.recent_activity;
                userList = userList.concat([obj]);
            }
            response.status(200).json(userList);
        }

    })

});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    //not logged in
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    //otherwise
    var id = request.params.id;

    User.find({ _id: id }, function (err, user) {
        if (err) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        } else {
            var obj = {
                _id: user[0]._id,
                first_name: user[0].first_name,
                last_name: user[0].last_name,
                location: user[0].location,
                description: user[0].description,
                occupation: user[0].occupation
            };
            response.status(200).json(obj);
        }
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 * The photos properties should be (_id, user_id, comments, file_name, date_time) and 
 * the comments array elements should have (comment, date_time, _id, user) and only the 
 * minimum user object information (_id, first_name, last_name). 
 */
app.get('/photosOfUser/:id', function (request, response) {
    //not logged in
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    //otherwise
    var id = request.params.id;
    var photosRes = [];

    Photo.find({ user_id: id }, function (err, photos) {
        if (err) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        } else {
            var photosList = JSON.parse(JSON.stringify(photos));
            if (photosList.length === 0) {
                console.log('Photos for user with _id:' + id + ' not found.');
                response.status(400).send('Not found');
                return;
            }
            async.each(photosList, proceedCurrPhoto, allPhotosDone);
        }

        //helper function: second parameter for async.each to proceed each photo object 
        function proceedCurrPhoto(currPhoto, callback1) {
            var tempPhoto = {};
            photosRes.push(tempPhoto);
            tempPhoto._id = currPhoto._id;
            tempPhoto.user_id = currPhoto.user_id;
            tempPhoto.file_name = currPhoto.file_name;
            tempPhoto.date_time = currPhoto.date_time;
            tempPhoto.user_ids_liked = currPhoto.user_ids_liked;


            async.each(currPhoto.comments, function (currComment, callback2) {
                if (typeof (tempPhoto.comments) === 'undefined') tempPhoto.comments = [];
                var tempComment = {
                    comment: currComment.comment,
                    date_time: currComment.date_time,
                    _id: currComment._id
                };
                tempPhoto.comments.push(tempComment);

                //add user object to tempComment
                User.find({ _id: currComment.user_id }, function (err, user) {
                    //extract user properties needed 
                    var commentUser = {};
                    commentUser._id = user[0]._id;
                    commentUser.first_name = user[0].first_name;
                    commentUser.last_name = user[0].last_name;

                    tempComment.user = commentUser;
                    callback2();
                })

            }, function (err) {
                if (err) {
                    console.error('Doing /photosOfUser error:', err);
                    response.status(500).send(JSON.stringify(err));
                    return;
                } else {
                    console.log('All comments of current photo have been proceeded successfully.');
                    callback1();
                }
            });

        }


        //helper function: third parameter for async.each to procedd photos
        function allPhotosDone(err) {
            if (err) {
                console.error('Doing /photosOfUser error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            } else {
                photosRes.sort((photo1, photo2) => {
                    let len1 = photo1.user_ids_liked.length;
                    let len2 = photo2.user_ids_liked.length;
                    console.log(photo1.date_time);
                    if (len1 === len2) {
                        let date1 = new Date(photo1.date_time);
                        let date2 = new Date(photo2.date_time);
                        return date2.getTime() - date1.getTime();
                    }
                    return len2 - len1;
                });
                console.log('All photos have been proceeded successfully.')
                response.status(200).json(photosRes);
            }
        }
    });


});

/**
 * provides a way for the photo app's LoginRegister view to login a user.
 * The POST request JSON-encoded body includes a property login_name(no passwards 
 * for now) and reply with information needed by app for logged in user.
 */
app.post('/admin/login', function (request, response) {
    var loginName = request.body.login_name;
    User.findOne({ login_name: loginName }, function (err, user) {
        if (err) {
            request.session.loggedIn = false;
            console.log('Login name: ' + loginName + ' is invalid.');
            response.status(400).send('Error occurred while matching login name.');
            return;
        }
        if (!user) {
            request.session.loggedIn = false;
            console.log('Login name: ' + loginName + ' is invalid.');
            response.status(400).send('Invalid login name.');
            return;
        }
        //doesPasswordMatch(hash, salt, clearTextPassword)
        if (!Password.doesPasswordMatch(user.password_digest, user.salt, request.body.password)) {
            request.session.loggedIn = false;
            console.log('Wrong password!');
            response.status(400).send('Wrong password.');
            return;
        }
        //valid login: store some information in session
        //make the session lasts 10 days when logging in
        request.session.cookie.maxAge = 10 * 24 * 60 * 60 * 1000;
        request.session.loggedIn = true;
        request.session._id = user._id;
        request.session.first_name = user.first_name;
        request.session.login_name = user.login_name;
        request.session.last_name = user.last_name;

        var obj = {
            _id: user._id,
            first_name: user.first_name,
            login_name: user.login_name,
            last_name: user.last_name
        };

        //save activity
        Activity.create({

            activity_type: "log in", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
            date_time: new Date(), // 	The date and time when the activity happen
            user_name: user.first_name + " " + user.last_name,
            photo_id: ""

        }, function (err, newActivity) {
            if (err) {
                console.log("error when create activity", err);
                response.status(400).send("error while creating activity.");
            }
            newActivity.save();

            //save the activity in user
            user.recent_activity = newActivity;
            user.save();

            response.status(200).json(obj);
        })
    });
});
/**
 * to allow a user to register. The registration POST takes a JSON-encoded body 
 * with the following properties: (login_name, password, first_name, last_name, 
 * location, description, occupation). 
 * The post request handler must make sure hat the new login_name is specified and doesn't already exist. 
 * The first_name, last_name, and password must be non-empty strings as well. 
 * If the information is valid, then a new user is created in the database. 
 * If there is an error, the response should return status 400 and a string indicating the error.
 */
app.post('/user', function (request, response) {
    var loginName = request.body.login_name;
    User.findOne({ login_name: loginName }, function (err, user) {
        //check empty. !value will be true if vale is null/undefined/empty
        if (!request.body.first_name) {
            console.log('First_name can not be empty!');
            response.status(400).send('First_name can not be empty!');
            return;
        }
        if (!request.body.last_name) {
            console.log('last_name can not be empty!');
            response.status(400).send('Last_name can not be empty!');
            return;
        }
        if (!request.body.login_name) {
            console.log('Login_name can not be empty!');
            response.status(400).send('Login_name can not be empty!');
            return;
        }
        if (!request.body.password) {
            console.log('Password can not be empty!');
            response.status(400).send('Password can not be empty!');
            return;
        }
        if (err) {
            console.log('Error while registration: ' + err);
            response.status(400).send('Error while registration: ' + err);
            return;
        }
        if (user !== null) {
            //user already exists
            console.log('User already exists.');
            response.status(400).send('User already exists.');
            return;
        }

        //valid register: save this newly created user
        var passwordEntry = Password.makePasswordEntry(request.body.password);
        var currUser = new User();
        currUser.login_name = request.body.login_name;
        currUser.password_digest = passwordEntry.hash;
        currUser.salt = passwordEntry.salt;
        currUser.first_name = request.body.first_name;
        currUser.last_name = request.body.last_name;
        currUser.location = request.body.location;
        currUser.description = request.body.description;
        currUser.occupation = request.body.occupation;
        currUser.favorites = [];

        // currUser.save();

        var obj = {
            _id: currUser._id,
            first_name: currUser.first_name,
            login_name: currUser.login_name
        };
        //save activity
        Activity.create({

            activity_type: "register", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
            date_time: new Date(), // 	The date and time when the activity happen
            user_name: currUser.first_name + " " + currUser.last_name,
            photo_id: ""

        }, function (err, newActivity) {
            if (err) {
                console.log("error when create activity", err);
                response.status(400).send("error while creating activity.");
            }
            newActivity.save();

            //save the activity in user
            currUser.recent_activity = newActivity;
            currUser.save();

            response.status(200).json(obj);
        })

    });
});

//get login state
app.get('/login-state', function (request, response) {
    var obj = {
        login: request.session.loggedIn,
        loginInFirstName: request.session.first_name,
        loginId: request.session._id
        // login_name: request.session.login_name
    };
    response.status(200).json(obj);
})

/**
 *  A POST request with an empty body to this URL will logout the user 
 *  by clearing the information stored in the session. An HTTP status of 
 * 400 (Bad request) should be returned in the user is not currently logged in.
 */
app.post('/admin/logout', function (request, response) {
    if (!request.session.loggedIn) {
        //currently no user logged in
        console.log("No user logged in.");
        response.status(400).send("No user logged in.");
        return;
    }
    User.findOne({ _id: request.session._id }, function (err, user) {
        if (err) {
            console.log(err);
            response.status(400).send("User not found.");
            return;
        }
        //save activity
        Activity.create({

            activity_type: "log out", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
            date_time: new Date(), // 	The date and time when the activity happen
            user_name: request.session.first_name + " " + request.session.last_name,
            photo_id: ""

        }, function (err, newActivity) {
            if (err) {
                console.log("error when create activity", err);
                response.status(400).send("error while creating activity.");
            }
            newActivity.save();

            //save the activity in user
            user.recent_activity = newActivity;
            user.save();

            //a user logged in, now log it out
            //Remove references with “delete”, then call request.session.destroy(callback)
            delete request.session.loggedIn;
            delete request.session._id;
            delete request.session.login_name;
            delete request.session.first_name;
            delete request.session.last_name;

            request.session.destroy(function (err) {
                if (err) response.status(400).send("Error when destroy session.");
                else response.status(200).send("Logged out successfully.");
            })
        })
    })

});

//Add a comment to the photo whose id is photo_id. The body of the POST requests 
//should be a JSON-encoded body with a single property comment that contains the 
//comment's text. 
//The comment object created on the photo must include the identifier of the logged 
//in user and the time when the comment was created. 
//Your implementation should reject any empty comments with a status of 400 (Bad request).
app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session.loggedIn) {
        //currently no user logged in
        console.log("No user logged in.");
        response.status(400).send("No user logged in.");
        return;
    }

    var photo_id = request.params.photo_id;
    Photo.findOne({ _id: photo_id }, function (err, photo) {
        if (err) {
            console.log("photo not found");
            response.status(400).send("Photo of id " + photo_id + " not found.");
            return;
        }
        if (!request.body.comment) {
            console.log("Comment is empty.");
            response.status(400).send("Comment can not be empty.");
            return;
        }
        //valid comment passed in
        var comment = {
            comment: request.body.comment,
            date_time: Date.now(),
            user_id: request.session._id
        };
        photo.comments.push(comment);
        photo.save();
        User.findOne({ _id: request.session._id }, function (err, user) {
            if (err) {
                console.log(err);
                response.status(400).send("user not found.");
                return;
            }
            //save activity
            Activity.create({

                activity_type: "comment", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
                date_time: new Date(), // 	The date and time when the activity happen
                user_name: request.session.first_name + " " + request.session.last_name,
                photo_id: photo_id,
                photo_file_name: photo.file_name

            }, function (err, newActivity) {
                if (err) {
                    console.log("error when create activity", err);
                    response.status(400).send("error while creating activity.");
                }
                newActivity.save();

                //save the activity in user
                user.recent_activity = newActivity;
                user.save();

                response.status(200).send("Comment to " + photo_id + " successfully.");
            })
        })
    })
});

/*
* Upload a photo for the current user. The body of the POST request should be the file 
* The uploaded files should be placed in the images directory under an unique name you 
* generated. 
* The unique name, along with the creation data and logged in user id, should be placed in 
* the new Photo object you create.
* A response status of 400 should be returned if there is no file in the POST request. 
*/
app.post('/photos/new', function (request, response) {
    //not logged in
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            console.log("No photo uploaded.");
            response.status(400).send("No photo uploaded.");
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' + String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            // XXX - Once you have the file written into your images directory under the name
            // filename you can create the Photo object in the database
            /* photo schema:
             * file_name: String 	
             * date_time: { type: Date, default: Date.now }
             * user_id: mongoose.Schema.Types.ObjectId,
             * comments: [commentSchema]
             */
            if (err) {
                console.log("error when upload a photo", err);
                response.status(500).send("Failed to save a file.");
                return;
            }
            Photo.create({
                file_name: filename,
                date_time: timestamp,
                user_id: request.session._id,
                comments: []
            }, (err, newPhoto) => {
                if (err) {
                    response.status(400).json(err);
                    return;
                }
                newPhoto.save();
                User.findOne({ _id: request.session._id }, function (err, user) {
                    if (err) {
                        console.log(err);
                        response.status(400).send("error while finding user.");
                        return;
                    }
                    if (!user) {
                        console.log("user not found.");
                        response.status(400).send("user not found.");
                        return;
                    }
                    //save activity
                    Activity.create({

                        activity_type: "upload", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
                        date_time: new Date(), // 	The date and time when the activity happen
                        user_name: request.session.first_name + " " + request.session.last_name,
                        photo_id: newPhoto._id,
                        photo_file_name: filename

                    }, function (err, newActivity) {
                        if (err) {
                            console.log("error when create activity", err);
                            response.status(400).send("error while creating activity.");
                        }
                        newActivity.save();

                        //save the activity in user
                        user.recent_activity = newActivity;
                        user.save();

                        response.status(200).send("photo uploaded successfully.")
                    })
                })

            })
        });

    });
})

//add a favorite photo. {photo_id: toAdd_id} passed in
app.post('/add-favorites', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    let toAdd_id = request.body.photo_id;
    User.findOne({ _id: request.session._id }, function (err, user) {
        if (err || !user) {
            console.log("user not found");
            response.status(400).send("user of id " + request.session._id + " not found.");
            return;
        }
        Photo.findOne({ _id: toAdd_id }, function (error, photo) {
            if (error || !photo) {
                console.log("photo not found");
                response.status(400).send("photo of id " + toAdd_id + " not found.");
                return;
            }
            if (user.favorites === undefined) user.favorites = [];
            user.favorites.push(toAdd_id);
            // user.save();

            //save activity
            Activity.create({

                activity_type: "favorite", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
                date_time: new Date(), // 	The date and time when the activity happen
                user_name: request.session.first_name + " " + request.session.last_name,
                photo_id: toAdd_id,
                photo_file_name: photo.file_name

            }, function (err, newActivity) {
                if (err) {
                    console.log("error when create activity", err);
                    response.status(400).send("error while creating activity.");
                }
                newActivity.save();

                //save the activity in user
                user.recent_activity = newActivity;
                user.save();

                response.status(200).send("Add to favorite successfully");
            })

        })
    })
})

//return favorite photos of the logged in user
app.get('/favorites', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    User.findOne({ _id: request.session._id }, function (err, user) {
        if (err || !user) {
            console.log("user not found");
            response.status(400).send("user of id " + request.session._id + " not found.");
            return;
        }
        if (user.favorites.length === 0) {
            //no favorite photos
            response.status(200).send([]);
            return;
        }
        let favoritePhotos = [];
        for (let photo_id of user.favorites) {
            favoritePhotos.push({
                file_name: "",
                date_time: null,
                _id: photo_id
            })
        }

        async.each(favoritePhotos, function (photo, callback) {
            Photo.findOne({ _id: photo._id }, function (err, photoFound) {
                if (err) {
                    console.log("photo not found");
                    response.status(400).send("photo of id " + photo._id + " not found.");
                    return;
                }
                photo.file_name = photoFound.file_name;
                photo.date_time = photoFound.date_time;
                callback();
            })
        }, function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log("all photos have been proceeded successfully.");
                response.status(200).send(favoritePhotos);
            }

        })


    })
})
//delete a favorite photo. {_id: toDelete_id } is passed in, 
//favorite photos after deleted will be returned.
app.post('/delete-favorite', function (request, response) {
    console.log("delete favorite begin");
    let user_id = request.session._id;
    let photo_id = request.body._id;
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    User.findOne({ _id: user_id }, function (err, user) {
        if (err || !user) {
            console.log("user not found");
            response.status(400).send("user of id " + user_id + " not found.");
            return;
        }
        user.favorites = user.favorites.filter(id => id !== photo_id);
        user.save();
        Photo.findOne({ _id: photo_id }, function (error, photo) {
            if (error) {
                console.log(error);
                response.status(400).send("photo not found.");
                return;
            }
            //save activity
            Activity.create({

                activity_type: "unfavorite", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
                date_time: new Date(), // 	The date and time when the activity happen
                user_name: request.session.first_name + " " + request.session.last_name,
                photo_id: photo_id,
                photo_file_name: photo.file_name

            }, function (err, newActivity) {
                if (err) {
                    console.log("error when create activity", err);
                    response.status(400).send("error while creating activity.");
                }
                newActivity.save();

                //save the activity in user
                user.recent_activity = newActivity;
                user.save();

                console.log("unfavorite successfully.");
                response.status(200).send("Delete successfully");
            })
        })


    })
})

//return favorite states of passed in photos list. {photoIds: ids} is passed in.
app.post('/favorite-states', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    let user_id = request.session._id;
    User.findOne({ _id: user_id }, function (err, user) {
        if (err || !user) {
            console.log("user not found");
            response.status(400).send("user of id " + user_id + " not found.");
            return;
        }
        let favoriteStates = [];

        for (let photoId of request.body.photoIds) {
            if (user.favorites.includes(photoId)) favoriteStates.push(true);
            else favoriteStates.push(false);
        }
        response.status(200).send(favoriteStates);
    })
})

//return logged in user name
app.get('/login-user-name', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    let user_id = request.session._id;
    User.findOne({ _id: user_id }, function (err, user) {
        if (err) {
            console.log("user not found");
            response.status(400).send("user of id " + user_id + " not found.");
            return;
        }
        let name = user.first_name + " " + user.last_name;
        response.status(200).send(name);
    })
})

//like or unlike a photo, based on the original state. {photo_id: id} passed in.
app.post('/like-toggle', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    let photo_id = request.body.photo_id;
    Photo.findOne({ _id: photo_id }, function (err, photo) {
        if (err || !photo) {
            console.log("photo not found");
            response.status(400).send("photo of id " + photo_id + " not found.");
            return;
        }
        let user_id = request.session._id;
        if (photo.user_ids_liked.includes(user_id)) {
            //remove like
            photo.user_ids_liked = photo.user_ids_liked.filter(id => id !== user_id);
            photo.save();
            User.findOne({ _id: user_id }, function (err, user) {
                if (err) {
                    console.log("user not found");
                    response.status(400).send("user of id " + user_id + " not found.");
                    return;
                }
                user.likes = user.likes.filter(id => id !== photo_id);
                // user.save();
                //save activity
                Activity.create({

                    activity_type: "unlike", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
                    date_time: new Date(), // 	The date and time when the activity happen
                    user_name: request.session.first_name + " " + request.session.last_name,
                    photo_id: photo_id,
                    photo_file_name: photo.file_name

                }, function (err, newActivity) {
                    if (err) {
                        console.log("error when create activity", err);
                        response.status(400).send("error while creating activity.");
                    }
                    newActivity.save();

                    //save the activity in user
                    user.recent_activity = newActivity;
                    user.save();

                    response.status(200).send("Unliked successfully.");
                })

            })
        } else {
            //add like
            photo.user_ids_liked.push(user_id);
            photo.save();
            User.findOne({ _id: user_id }, function (err, user) {
                if (err) {
                    console.log("user not found");
                    response.status(400).send("user of id " + user_id + " not found.");
                    return;
                }
                user.likes.push(photo_id);
                // user.save();

                //save activity
                Activity.create({

                    activity_type: "like", // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
                    date_time: new Date(), // 	The date and time when the activity happen
                    user_name: request.session.first_name + " " + request.session.last_name,
                    photo_id: photo_id,
                    photo_file_name: photo.file_name

                }, function (err, newActivity) {
                    if (err) {
                        console.log("error when create activity", err);
                        response.status(400).send("error while creating activity.");
                    }
                    newActivity.save();

                    //save the activity in user
                    user.recent_activity = newActivity;
                    user.save();

                    response.status(200).send("Liked successfully.")
                })

            })
        }
    })
})

//return like counts of passed in photos list. {photoIds: ids} is passed in.
app.post('/like-counts', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    let photoIds = request.body.photoIds;
    let counts = [];
    async.each(photoIds, function (photo_id, callback) {
        Photo.findOne({ _id: photo_id }, function (err, photoFound) {
            if (err) {
                console.log("photo not found");
                response.status(400).send("photo of id " + photo_id + " not found.");
                return;
            }
            let currIdx = photoIds.indexOf(photo_id);
            counts[currIdx] = photoFound.user_ids_liked.length;
            callback();
        })
    }, function (error) {
        if (error) {
            console.log(error);
            response.status(400).send(error);
        } else {
            response.status(200).send(counts);
        }
    })

})

//return like states of a photo list. {photoIds : ids} is passed in.
app.post('/like-states', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }
    let user_id = request.session._id;
    User.findOne({ _id: user_id }, function (err, user) {
        if (err || !user) {
            console.log("user not found");
            response.status(400).send("user of id " + user_id + " not found.");
            return;
        }
        let likeStates = [];

        for (let photoId of request.body.photoIds) {
            if (user.likes.includes(photoId)) likeStates.push(true);
            else likeStates.push(false);
        }
        response.status(200).send(likeStates);
    })
})

//return five most recent activities
app.get('/activities', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("unauthorized");
        return;
    }

    Activity.find().sort({ date_time: -1 }).limit(5).exec(function (err, items) {
        if (err) {
            console.log("error when find activities.");
            response.status(400).send("error when find activities.");
            return;
        }
        if (!items) {
            console.log("No recent activities");
            response.status(400).send([]);
            return;
        }
        response.status(200).send(items);
    });

})

/**************************************************************************************************************************/
var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});






