import React from 'react';
import { Link } from 'react-router-dom';
import { Paper } from '@material-ui/core';
import './userComments.css';
import axios from 'axios';


/**
 * Define UserComments, a React componment of CS142 project #7
 */
class UserComments extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userListURL: '/user/list',
      userDetailsURL: '/user/',
      photosURL: '/photosOfUser/',
      commentedPhotos: [],
      errorObj: undefined
    }
    this.updateState = this.updateState.bind(this);
  }


  componentDidMount() {
    
    this.updateState();
    var currUserId = this.props.match.params.userId;
    axios.get(this.state.userDetailsURL + currUserId).then((userObj) => {
      var value = "Comments of " + userObj.data.first_name + " " + userObj.data.last_name;
      this.props.handler(value);
    }).catch((error) => {
      this.setState({
        errorObj: error
      });
    })
  }

  componentDidUpdate(prevProps) {
    var currUserId = this.props.match.params.userId;
    if (currUserId !== prevProps.match.params.userId) {
      this.updateState();
      axios.get(this.state.userDetailsURL + currUserId).then((userObj) => {
        var value = "Comments of " + userObj.data.first_name + " " + userObj.data.last_name;
        this.props.handler(value);
      }).catch((error) => {
        this.setState({
          errorObj: error
        });
      })
    }

  }

  //update the elements stored in state (to be displayed) when id of the url changes
  updateState() {
    
    var self = this;
    var async = require('async');
    var targetId = this.props.match.params.userId;
    var photosResList = [];
    var photosPreURL = this.state.photosURL;
    var usersPreURL = this.state.userListURL;

    axios.get(usersPreURL).then((users) => {

      async.each(users.data, (currUser, callback) => {
        var currId = currUser._id;
        axios.get(photosPreURL + currId).then((photos) => {
          var photosList = photos.data;

          //proceed each photo
          for (let i = 0; i < photosList.length; i++) {
            var comments = photosList[i].comments;

            if (comments !== undefined) {
              var commentsToAdd = [];
              // pick out comments to add
              for (let j = 0; j < comments.length; j++) {
                if (comments[j].user._id == targetId) commentsToAdd.push(comments[j]);
              }
              // add photo and comments
              if (commentsToAdd.length !== 0) {
                photosResList.push(
                  <Paper className="userComments_container_paper" key={photosList[i]._id}>
                    <div className="userComments_container" >
                      <Link className="userComments_link" to={"/photos/" + photosList[i].user_id}>
                        <img className="userComments_photo" src={"../images/" + photosList[i].file_name} />
                      </Link>

                      <div className="userComments_photo_comments_container">
                        {this.addCommentsOf(commentsToAdd, photosList[i].user_id)}
                      </div>
                    </div>

                  </Paper>
                )
              }
            }
          }
          callback();
        }).catch(function (error) {
          console.log("error when proceeding comments: " + error);
        })
      }, function (err) {
        if (err) console.log(err);
        else {
          self.setState({
            commentedPhotos: photosResList
          })
        }
      });
    }).catch((error) => {
      self.setState({
        commentedPhotos: [],
        errorObj: error
      });
    })
  }

  // helper function called by updateState(). add comments to current photo.
  addCommentsOf(commentsToAdd, userIdOfPhoto) {
    var res = [];
    for (var comment of commentsToAdd) {
      res.push(
        <div key={comment._id} className="userComments_comment_line">
          <Link className="userComments_link" to={"/photos/" + userIdOfPhoto}>
            <span className="userComments_comment_header">comment: </span>
            {comment.comment}
          </Link>
        </div>

      )
    }
    return res;
  }




  render() {
    return (
      <div className="userComments_most_outter_container">
        {this.state.commentedPhotos}
      </div>
    );
  }
}

export default UserComments;
