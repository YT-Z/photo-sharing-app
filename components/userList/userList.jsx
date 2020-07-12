import React from 'react';
import { Link } from 'react-router-dom';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography
}
  from '@material-ui/core';
import './userList.css';
import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  intervalID;
  constructor(props) {
    super(props);
    this.state = {
      userListURL: '/user/list',
      rightBarVal: 'User List',
      users: [],
      errorObj: undefined
    }
    this.getUsers = this.getUsers.bind(this);
  }

  getUsers() {
    axios.get(this.state.userListURL).then(obj => {
      if (this.state.users !== obj.data) {
        this.setState({ users: obj.data });
      }
    }).catch((error) => {
      this.setState({
        users: undefined,
        errorObj: error
      });
    })
  }

  componentDidMount() {
    this.props.handler(this.state.rightBarVal);
    this.getUsers();
    this.intervalID = setInterval(this.getUsers, 2000);
  }

  componentWillUnmount() {
    //stop getUsers() from continuing to run even after unmounting this component
    clearInterval(this.intervalID);
  }


  displayRecentActivity(user) {
    let activity = user.recent_activity;
    if (!activity) return (
      <div className="userList_activity_activity">no recent activity</div>
    );
    let res;
    switch (activity.activity_type) {
      case "register":
        res = (
          <div
            key={user._id}
            className="userList_activity_activity"
          >Registerd as a user</div>

        );
        break;
      case "log in":
        res = (
          <div
            key={user._id}
            className="userList_activity_activity"
          >User logged in</div>
        );
        break;
      case "log out":
        res = (
          <div
            key={user._id}
            className="userList_activity_activity"
          >User logged out</div>
        );
        break;
      case "upload":
        res = (
          <div key={user._id} className="userList_activity_horizontal_flex">
            <div className="userList_activity_activity">Posted a photo </div>
            <img className="userList_activity_photo" src={"../images/" + activity.photo_file_name} />
          </div>
        );
        break;
      case "comment":
        res = (
          <div key={user._id} className="userList_activity_horizontal_flex">
            <div className="userList_activity_activity">Added a comment </div>
            <img className="userList_activity_photo" src={"../images/" + activity.photo_file_name} />
          </div>
        );
        break;
      case "like":
        res = (
          <div key={user._id} className="userList_activity_horizontal_flex">
            <div className="userList_activity_activity">Liked a photo </div>
            <img className="userList_activity_photo" src={"../images/" + activity.photo_file_name} />
          </div>
        );
        break;
      case "unlike":
        res = (
          <div key={user._id} className="userList_activity_horizontal_flex">
            <div className="userList_activity_activity">Unliked a photo </div>
            <img className="userList_activity_photo" src={"../images/" + activity.photo_file_name} />
          </div>

        );
        break;
      case "favorite":
        res = (
          <div key={user._id} className="userList_activity_horizontal_flex">
            <div className="userList_activity_activity">Favorited a photo </div>
            <img className="userList_activity_photo" src={"../images/" + activity.photo_file_name} />
          </div>

        );
        break;
      case "unfavorite":
        res = (
          <div key={user._id} className="userList_activity_horizontal_flex">
            <div className="userList_activity_activity">Unfavorited a photo </div>
            <img className="userList_activity_photo" src={"../images/" + activity.photo_file_name} />
          </div>
        );
        break;
    }
    return res;
  }



  //display users in render() method. Put in user information if applicable, otherwise show error message.
  displayUsers() {
    if (this.state.users === undefined) {
      return <p>{this.state.errorObj}</p>;
    }
    var listUsers = this.state.users.map(user =>
      <div key={user._id}>
        <ListItem>
          <div className="userList_vertical_flex">
            <Link className="userList_name_link" to={`/users/${user._id}`}>
              <ListItemText className="userList_name">
                <Typography variant="body1">{user.first_name + " " + user.last_name}</Typography>
              </ListItemText>
            </Link>

            <div>{this.displayRecentActivity.bind(this)(user)}</div>

          </div>
        </ListItem>
        <Divider />
      </div>
    )
    return listUsers;
  }

  render() {
    return (
      <div>
        <Link to="/users" className="userList_link">
          <Button
            className="userList_head"
            variant="outlined"
            color="secondary">
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

export default UserList;
