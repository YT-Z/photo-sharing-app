import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid, Checkbox, FormControlLabel, Button
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import './TopBar.css';

/**
 * Define TopBar, a React componment of CS142 project #5
 */

const axios = require('axios');

class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      logoutPostURL: "/admin/logout" //used when POST 
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUploadPhoto = this.handleUploadPhoto.bind(this);
  }

  //called when upload photo button is clicked
  handleUploadPhoto(e) {
    e.preventDefault();

    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res.data);
          alert(res.data);
        })
        .catch(err => {
          console.log(`POST ERR: ${err}`);
          alert(`POST ERR: ${err}`);
        })
    }
  }

  //called when logout button is clicked
  handleSubmit(e) {
    e.preventDefault();//stop DOM from generating a POST

    if (!this.props.login) {
      // no user logged
      alert("No user logged in.");
      return;
    } else {
      //has a user logged in
      axios.post(this.state.logoutPostURL).then(() => {
        //pass logout state to photoShare.jsx
        this.props.logoutHandler();

      }).catch(err => {
        alert(err.response.data);
      });
    }
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Grid container spacing={0}>

            <Grid item xs={this.props.login ? 2 : 3}>
              <Typography className="topBar_leftBar" variant="h5" color="inherit">
                {this.props.leftBar}
              </Typography>
            </Grid>

            <Grid className="topBar_login_logout_info" item xs={this.props.login ? 2 : 3}>
              {
                this.props.login ?
                  <div className="topBar_logout_container">
                    <span className="topBar_greeting">Hi {this.props.loginInFirstName} </span>

                    <Button
                      className="topBar_logout_button"
                      variant="contained"
                      onClick={this.handleSubmit}
                      size="small">Logout</Button>
                  </div>

                  :
                  <div className="topBar_login_reminder">Please Login</div>

              }
            </Grid>

            {this.props.login &&
              <Grid
                className="topBar_upload_photo_container"
                item xs={4}>
                <input
                  className="topBar_choose_file"
                  type="file"
                  accept="image/*"
                  ref={(domFileRef) => { this.uploadInput = domFileRef; }} />

                <div className="topBar_upload_button_container">
                  <Button
                    className="topBar_upload_photo_button"
                    variant="contained"
                    onClick={this.handleUploadPhoto}
                    size="small"
                  >Upload photo</Button>

                </div>

              </Grid>
            }

            <Grid item xs={this.props.login ? 2 : 3}>
              {this.props.login ?
                <div>
                  <FormControlLabel className="topBar_checkBox_label"
                    control={
                      <Checkbox checked={this.props.checked}
                        onChange={this.props.onChange}
                      />
                    }
                    label={<span className="topBar_checkbox_label">Advanced feature</span>} />
                  <Link to="/favorites" className="topBar_favorite_photos_link">favorites</Link>
                  <Link to="/activities" className="topBar_activities_link">Activities</Link>
                </div>
                :
                <div></div>
              }

            </Grid>

            <Grid item xs={this.props.login ? 2 : 3}>
              <Typography className="topBar_rightBar" variant="body1" color="inherit">
                {this.props.rightBar}
              </Typography>
            </Grid>

          </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
