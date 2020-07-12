import React from 'react';
import { Link } from 'react-router-dom';
import {
    Divider,
    List,
    ListItem,
    ListItemText,
    Button
}
    from '@material-ui/core';
import './advancedUserList.css';
import axios from 'axios';

// import { countPhotosOf, countCommentsAuthoredBy } from '../../webServer.js'



/**
 * Define advancedUserList componment 
 */

class AdvancedUserList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userListURL: '/user/list',
            photosURL: '/photosOfUser/',
            rightBarVal: 'User List',
            users: [],
            errorObj: undefined
        }

    }


    componentDidMount() {
       
        axios.get(this.state.userListURL).then((obj) => {
            this.setState({ users: obj.data });
            this.props.handler(this.state.rightBarVal);
        }).catch((error) => {
            this.setState({
                users: undefined,
                errorObj: error
            });
        })

    }



    //count photos of user of given id
    countPhotosOf(id) {
        axios.get(this.state.photosURL + id).then(function (photos) {
            var targetElement = document.getElementById("photosNum" + id);
            targetElement.innerHTML = photos.data.length;
        }).catch(() => {
            var targetElement = document.getElementById("photosNum" + id);
            targetElement.innerHTML = 0;
        });
    }

    //count comments authored by user of given id
    countCommentsAuthoredBy(id) {
        var async = require('async');
        var counts = [];
        var users = this.state.users;
        var preURL = this.state.photosURL;
        async.each(users, (currUser, callback) => {
            var currId = currUser._id;
            axios.get(preURL + currId).then((photos) => {
                var tempCount = 0;
                var photosList = photos.data;
                for (let i = 0; i < photosList.length; i++) {
                    var comments = photosList[i].comments;
                    if (comments !== undefined) {
                        for (let j = 0; j < comments.length; j++) {
                            if (comments[j].user._id == id) tempCount++;
                        }
                    }

                }
                // counts.push(tempCount);
                counts = counts.concat([tempCount]);
                callback();
            }).catch(function (error) {
                console.log(error);
                // var targetElement = document.getElementById("commentsNum" + id);
                // targetElement.innerHTML = 0;
            })
        }, function (err) {
            if (err) {
                console.log(err);
                // var targetElement = document.getElementById("commentsNum" + id);
                // targetElement.innerHTML = 0;
            }
            else {
                var totalCount = 0;
                for (var c of counts) {
                    totalCount += c;
                }
                var targetElement = document.getElementById("commentsNum" + id);
                targetElement.innerHTML = totalCount;
            }
        });
    }


    //display users in render() method. Put in user information if applicable, otherwise show error message.
    displayUsers() {
        if (this.state.users === undefined) {
            return <p>{this.state.errorObj}</p>;
        }
        var listUsers = this.state.users.map(user =>
            <div key={user._id}>
                <ListItem>
                    <Link className="advancedUserList_name_link" to={`/users/${user._id}`}>
                        <ListItemText className="advancedUserList_name" primary={user.first_name + " " + user.last_name} />
                    </Link>
                    <div className="advancedUserList_photos" id={"photosNum" + user._id}>
                        {this.countPhotosOf.bind(this)(user._id)}
                    </div>
                    <Link className="advancedUserList_comments_link" to={"/comments/" + user._id}>
                        <div className="advancedUserList_comments" id={"commentsNum" + user._id}>
                            {this.countCommentsAuthoredBy.bind(this)(user._id)}
                        </div>
                    </Link>
                </ListItem>
                <Divider />
            </div>
        )
        return listUsers;
    }

    render() {
        return (
            <div>
                <Link to="/users" className="advancedUserList_link">
                    <Button className="advancedUserList_head">
                        User list:
          </Button>
                </Link>

                <List component="nav">
                    {this.displayUsers.bind(this)()}
                </List>
            </div>
        );
    }
}

export default AdvancedUserList;
