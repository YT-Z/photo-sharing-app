"use strict"

var mongoose = require('mongoose');

// create a schema for Activity
var activitySchema = new mongoose.Schema({
    activity_type: String, // can be upload, comment, register, log in, log out, like, unlike, favorite, unfavorite
    date_time: {type: Date, default: Date.now}, // 	The date and time when the activity happen
    user_name: String, // the name of the user that performed the activity
    photo_id: String, // photo id associated with the activity
    photo_file_name: String
    
});

// the schema is useless so far
// we need to create a model using it
var Activity = mongoose.model('Activity', activitySchema);

// make this available to our Node applications
module.exports = Activity;