import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import UserComments from './components/userComments/UserComments';
import axios from 'axios';
import AdvancedUserList from './components/advancedUserList/advancedUserList';
import LoginRegister from './components/loginRegister/LoginRegister';
import Register from './components/register/Register';
import FavoritePhotos from './components/favoritePhotos/FavoritePhotos';
import Activities from './components/activities/Activities';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      login: false,
      loginId: "",
      loginInFirstName: "",
      rightBar: " ",
      leftBar: "Yiting",
      defaultRightBar: "id number",
      testInfoURL: '/test/info',
      versionNum: undefined,
      errorObj: undefined,
      checked: false
    }

    this.handler = this.handler.bind(this);
    this.checkedOnChange = this.checkedOnChange.bind(this);
    this.loginHandler = this.loginHandler.bind(this);
    this.logoutHandler = this.logoutHandler.bind(this);
    this.checkLoginState = this.checkLoginState.bind(this);
  }

  //get login state from server side
  checkLoginState() {
    axios.get('/login-state').then((obj) => {
      if (obj.data.login && !this.state.login) {
        this.setState({
          ...obj.data
        })
      } else if (!obj.data.login && this.state.login) {
        this.setState({
          login: false,
          loginId: "",
          loginInFirstName: ""
        })
      }
    }).catch(err => {
      console.log(err);
    })
  }

  componentDidMount() {
    this.checkLoginState();
    axios.get(this.state.testInfoURL).then((obj) => {
      this.setState({ versionNum: obj.data.version });
    }).catch((error) => {
      this.setState({
        versionNum: undefined,
        errorObj: error
      });
    })
  }

  //update right bar to indicate current content 
  handler(value) {
    this.setState({
      rightBar: value
    })
  }

  //pass advanced feature option to photoShare 
  checkedOnChange() {
    this.setState({
      checked: !this.state.checked
    })
  }

  //pass login information from loginRegister to photoShare
  loginHandler(loginState, id, firstName, lastName) {
    this.setState({
      login: loginState,
      loginId: id,
      loginInFirstName: firstName,
      rightBar: firstName + " " + lastName

    })
  }
  //pass logout information from topBar to photoShare
  logoutHandler() {
    this.setState({
      login: false,
      loginId: "",
      loginInFirstName: "",
      rightBar: ""
    })
  }

  //display version number in render method if applicable, otherwise display error message
  displayVersionNum() {
    if (this.state.versionNum !== undefined) return this.state.versionNum;
    return this.state.errorObj;
  }

  displayUserList() {
    //don't display userList if not logged in
    if (!this.state.login) return;
    if (!this.state.checked) {
      return (
        <Paper className="cs142-main-grid-item">
          <UserList handler={this.handler} />
        </Paper>);
    } else {
      return (
        <Paper className="cs142-main-grid-item">
          <AdvancedUserList handler={this.handler} />
        </Paper>);
    }
  }


  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>

            <Grid item xs={12}>
              <TopBar
                login={this.state.login}
                loginInFirstName={this.state.loginInFirstName}
                leftBar={this.state.leftBar + this.state.versionNum}
                rightBar={this.state.rightBar}
                onChange={this.checkedOnChange}
                checked={this.state.checked}
                logoutHandler={this.logoutHandler}
              />
            </Grid>

            <div className="cs142-main-topbar-buffer" />

            <Grid item sm={3}>
              {this.displayUserList.bind(this)()}
            </Grid>

            <Grid item sm={9}>
              <Switch>
                <Route path="/register"
                  render={() => <Register />} />

                {!this.state.login ?
                  <Route path="/login-register"
                    render={props => <LoginRegister loginHandler={this.loginHandler} {...props} />} />
                  :
                  <Redirect path="/login-register" to={"/users/" + this.state.loginId} />
                }

                {this.state.login ?
                  <Route exact path="/"
                    render={() =>
                      <Paper className="cs142-main-grid-item">
                        <React.Fragment>
                          <TopBar
                            leftBar={this.state.leftBar + this.state.versionNum}
                            login={this.state.login}
                            loginInFirstName={this.state.loginInFirstName}
                            rightBar={this.state.defaultRightBar}
                            onChange={this.checkedOnChange}
                            checked={this.state.checked}
                            logoutHandler={this.logoutHandler}
                          />

                          <Typography variant="body1">
                            {this.displayVersionNum.bind(this)()}

                          </Typography>
                        </React.Fragment>
                      </Paper>
                    }
                  />
                  :
                  <Redirect path="/" to="/login-register" />
                }

                {this.state.login ?
                  <Route path="/users/:userId"
                    render={props =>
                      <Paper className="cs142-main-grid-item">
                        <UserDetail handler={this.handler} {...props} />
                      </Paper>}
                  />
                  :
                  <Redirect path="/" to="/login-register" />
                }

                {this.state.login ?
                  <Route path="/photos/:userId"
                    render={props =>
                      <Paper className="cs142-main-grid-item">
                        <UserPhotos handler={this.handler}  {...props} />
                      </Paper>}
                  />
                  :
                  <Redirect path="/" to="/login-register" />
                }

                {this.state.login ?
                  <Route path="/comments/:userId"
                    render={props =>
                      <Paper className="cs142-main-grid-item">
                        <UserComments handler={this.handler}  {...props} />
                      </Paper>}
                  />
                  :
                  <Redirect path="/" to="/login-register" />
                }

                {this.state.login ?
                  <Route path="/users"
                    render={props =>
                      <Paper className="cs142-main-grid-item">
                        <UserList handler={this.handler} {...props} />
                      </Paper>} />
                  :
                  <Redirect path="/" to="/login-register" />
                }

                {this.state.login ?
                  <Route path="/favorites" render={props =>
                    <Paper className="cs142-main-grid-item">
                      <FavoritePhotos handler={this.handler} {...props} />
                    </Paper>} />

                  :
                  <Redirect path="/favorites" to="/login-register" />
                }

                {this.state.login ?
                  <Route path="/activities" render={props =>
                    <Paper className="cs142-main-grid-item">
                      <Activities handler={this.handler} {...props} />
                    </Paper>} />

                  :
                  <Redirect path="/activities" to="/login-register" />
                }

              </Switch>

            </Grid>
          </Grid>
        </div>
      </HashRouter >
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
