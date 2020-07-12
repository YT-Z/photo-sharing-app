import React from 'react';
import { Link } from 'react-router-dom';
import {
  Divider,
  Paper,
  Button,
  IconButton
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import './userPhotos.css';
import axios from 'axios';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commentPostURL: '/commentsOfPhoto/',//used for post comment, append photo_id 
      userDetailsURL: '/user/',
      photosURL: '/photosOfUser/',
      photos: [],//when get photos from server, the order is based on like counts + upload date
      photoIds: [],
      errorObj: undefined,
      comment: '',
      commentPhotoId: '',
      favoriteStates: [],//favorite states of each photo
      likeStates: [],//boolean, indicate whether the logged in user likes each photo
      likeCounts: []//like counts of each photo
    }
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onFavorite = this.onFavorite.bind(this);
    this.onToggleLike = this.onToggleLike.bind(this);
  }

  //when input comment changed, this method will be called.
  //store the input in this.state.comment
  handleCommentChange(e) {
    e.preventDefault();
    const { name, value, id } = e.target;
    this.setState({
      [name]: value,
      commentPhotoId: id
    });
  }

  //when button of comment is hit, try to submit this comment
  handleSubmit(e) {
    e.preventDefault();//stop DOM from generating a POST

    if (!this.state.comment) {
      //no comment text
      alert("No comment text.");
    } else {
      //comment text is not empty
      const axios = require('axios');

      axios.post(this.state.commentPostURL + this.state.commentPhotoId, {
        comment: this.state.comment
      }).then(() => {
        //clear input field
        var input = document.getElementById(this.state.commentPhotoId);
        input.value = "";
        //clear state
        this.setState({
          comment: '',
          commentPhotoId: ''
        });
        //update comments right after comment submitted
        var currUserId = this.props.match.params.userId;
        axios.get(this.state.photosURL + currUserId).then((obj) => {
          this.setState({ photos: obj.data });
          axios.get(this.state.userDetailsURL + currUserId).then((userObj) => {
            var value = "Photos of " + userObj.data.first_name + " " + userObj.data.last_name;
            this.props.handler(value);
          })
        }).catch((error) => {
          this.setState({
            photos: undefined,
            errorObj: error
          });
        })

      }).catch(err => {
        alert(err.response.data);
      });
    }
  }


  componentDidMount() {

    var currUserId = this.props.match.params.userId;
    axios.get(this.state.photosURL + currUserId).then((obj) => {
      this.setState({ photos: obj.data }, () => {
        let photo_ids = [];
        for (let photo of this.state.photos) {
          photo_ids.push(photo._id);
        }
        this.setState({ photoIds: photo_ids });
      });
      return axios.get(this.state.userDetailsURL + currUserId);
    }).then((userObj) => {
      var value = "Photos of " + userObj.data.first_name + " " + userObj.data.last_name;
      this.props.handler(value);
      //initiate favorite states
      axios.post('/favorite-states', { photoIds: this.state.photoIds }).then(response => {
        this.setState({
          favoriteStates: response.data
        });
        return axios.post('/like-states', { photoIds: this.state.photoIds });
      }).then(response => {
        this.setState({
          likeStates: response.data
        });
        return axios.post('/like-counts', { photoIds: this.state.photoIds });
      }).then(response => {
        this.setState({ likeCounts: response.data });
      })
    }).catch((error) => {
      this.setState({
        photos: undefined,
        errorObj: error
      });
      console.log(error.response.data);
    });

  }

  componentDidUpdate(prevProps) {
    var currUserId = this.props.match.params.userId;
    if (currUserId !== prevProps.match.params.userId) {
      axios.get(this.state.photosURL + currUserId).then((obj) => {
        this.setState({ photos: obj.data }, () => {
          let photo_ids = [];
          for (let photo of this.state.photos) {
            photo_ids.push(photo._id);
          }
          this.setState({ photoIds: photo_ids });
        });
        return axios.get(this.state.userDetailsURL + currUserId);
      }).then((userObj) => {
        var value = "Photos of " + userObj.data.first_name + " " + userObj.data.last_name;
        this.props.handler(value);
        //update favorite states
        axios.post('/favorite-states', { photoIds: this.state.photoIds }).then(
          response => {
            this.setState({
              favoriteStates: response.data
            });
            return axios.post('/like-states', { photoIds: this.state.photoIds });
          }).then(response => {
            this.setState({
              likeStates: response.data
            });
            return axios.post('/like-counts', { photoIds: this.state.photoIds });
          }).then(response => {
            this.setState({ likeCounts: response.data });
          });
      }).catch((error) => {
        this.setState({
          photos: undefined,
          errorObj: error
        });
        console.log(error);
      });
    }
  }
  //add a photo to favorite, called when favorite icon is clicked
  onFavorite(photo_id) {
    axios.post('/add-favorites', { photo_id: photo_id })
      .then(() => {
        axios.post('/favorite-states', { photoIds: this.state.photoIds }).then(
          response => {
            this.setState({
              favoriteStates: response.data
            });
          })
      }).catch(error => {
        alert(error.response.data);
      });
  }



  //like or unlicke a photo
  onToggleLike(photoId) {
    axios.post('/like-toggle', { photo_id: photoId }).then(() => {
      return axios.post('/like-counts', { photoIds: this.state.photoIds });
    }).then(res => {
      this.setState({ likeCounts: res.data });
      return axios.post('/like-states', { photoIds: this.state.photoIds });
    }).then(res => {
      this.setState({ likeStates: res.data });
    }).catch(error => {
      console.log(error);
      alert(error.response.data);
    })
  }

  // called by render() method to add photo informations
  displayPhotos() {
    if (this.state.photos === undefined) return <div>{this.state.errorObj}</div>;
    var photosList = [];
    for (let i = 0; i < this.state.photos.length; i++) {
      let photo = this.state.photos[i];
      photosList.push(
        <Paper key={photo._id}>
          <div className="userPhotos_container" >
            <img className="userPhotos_photo" src={"../images/" + photo.file_name} />

            <div className="userPhotos_time_like_favorite_container">
              <div>
                <div className="userPhotos_photo_create_time">Photo created on {photo.date_time}</div>

                <div className="userPhotos_like_favorite_wrapper">
                  {/* like icon below */}
                  {this.state.likeStates[i] ?
                    <div className="userPhotos_like_icon_wrapper">
                      <div className="userPhotos_like_icon_inner_wrapper">
                        <IconButton
                          color="primary"
                          className="userPhotos_like_icon"
                          onClick={() => this.onToggleLike(photo._id)}
                        >
                          <ThumbDownIcon />
                        </IconButton>
                        <span>{this.state.likeCounts[i]} likes</span>
                        <span className="userPhotos_liked"> (You have liked it) </span>
                      </div>

                    </div>
                    :
                    <div className="userPhotos_like_icon_inner_wrapper">
                      <IconButton
                        color="secondary"
                        className="userPhotos_like_icon"
                        onClick={() => this.onToggleLike(photo._id)}
                      >
                        <ThumbUpIcon />
                      </IconButton>
                      <span>{this.state.likeCounts[i]} likes</span>
                    </div>
                  }

                  {/* favorite icon below */}
                  {this.state.favoriteStates[i] ?
                    <div>
                      <IconButton
                        color="secondary"
                        className="userPhotos_favorite_icon"
                        disabled={true}
                      >
                        <FavoriteIcon />
                      </IconButton>
                      <span className="userPhotos_favorited">favorited</span>
                    </div>
                    :
                    <IconButton
                      color="secondary"
                      className="userPhotos_favorite_icon"
                      onClick={() => this.onFavorite(photo._id)}>
                      <FavoriteIcon />
                    </IconButton>
                  }
                </div>
                <div className="userPhotos_photo_comments_container">{this.getComments.bind(this)(photo.comments)}</div>
              </div>
            </div>
            {/* comment area */}
            <form onSubmit={this.handleSubmit}>
              <div className="userPhotos_comment_container">
                <textarea
                  id={photo._id}
                  className="userPhotos_comment_input"
                  type="text"
                  name="comment"
                  onChange={this.handleCommentChange} >
                </textarea>



                <div className="userPhotos_comment_button_container">
                  <Button
                    variant="contained"
                    className="userPhotos_comment_button"
                    color="secondary"
                    size="small"
                    type="submit">Comment</Button>
                </div>
              </div>
            </form>
          </div>
        </Paper >
      )
    }
    return photosList;
  }

  //helper function: called by displayPhotos() to add comments information
  getComments(comments) {
    if (typeof (comments) === 'undefined') return (
      <div className="userPhotos_no_comments">
        <div>No comments.</div>
        <Divider />
      </div>
    );
    var commentsList = [];
    commentsList.push(<div key="comment_title" className="userPhotos_comments_title">Comments: </div>);
    for (let comment of comments) {
      commentsList.push(
        <div key={comment._id} className="userPhotos_comments_container" >

          <div >
            <Link className="userPhotos_comment_creator" to={"/users/" + comment.user._id}>
              {comment.user.first_name + " " + comment.user.last_name}:
              </Link>
          </div>
          <div className="userPhotos_comment_create_time"> {comment.date_time}</div>
          <div className="userPhotos_comment_text">{comment.comment}</div>
          <Divider />
        </div>
      )
    }
    return commentsList;
  }

  render() {
    return (
      <div>{this.displayPhotos.bind(this)()}</div>
    );
  }
}

export default UserPhotos;
