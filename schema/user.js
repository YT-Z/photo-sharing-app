"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

var activity = new mongoose.Schema({
    activity_type: String, // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
    date_time: { type: Date, default: Date.now }, // 	The date and time when the activity happen
    user_name: String, // the name of the user that performed the activity
    photo_id: String, // photo id associated with the activity
    photo_file_name: String

});

// create a schema
var userSchema = new mongoose.Schema({
    login_name: String,//Login name of the user
    // password: String,//Password to login
    password_digest: String,//password_digest with salt as prefix of a passward, use SHA-1
    salt: String,//prefix of a password for compute digest

    first_name: String, // First name of the user.
    last_name: String,  // Last name of the user.
    location: String,    // Location  of the user.
    description: String,  // A brief user description
    occupation: String,    // Occupation of the user.

    favorites: [String], // IDs of favorite photos
    likes: [String],//IDs of liked photos
    recent_activity: { type: activity }
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
