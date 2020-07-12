import React from 'react';
import { Link } from 'react-router-dom';
import './userDetail.css';
import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetailsURL: '/user/',
      user: [],
      errorObj: undefined
    }
  }



  // make sure the first mount node has the information
  componentDidMount() {
    
    axios.get(this.state.userDetailsURL + this.props.match.params.userId).then((obj) => {
      this.setState(
        { user: obj.data },
        () => {
          var value = this.state.user.first_name + " " + this.state.user.last_name;
          this.props.handler(value);
        });
    }).catch((error) => {
      this.setState({
        users: undefined,
        errorObj: error
      });
    })
  }


  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      axios.get(this.state.userDetailsURL + this.props.match.params.userId).then((obj) => {
        this.setState(
          { user: obj.data },
          () => {
            var value = this.state.user.first_name + " " + this.state.user.last_name;
            this.props.handler(value);
          });
      }).catch((error) => {
        this.setState({
          users: undefined,
          errorObj: error
        });
      })

    }
  }

  // put user details into render() method
  displayUserDetails() {
    if (this.state.user === undefined) return <div>{this.state.errorObj}</div>;
    var userDetails = [];
    for (let [key, value] of Object.entries(this.state.user)) {
      userDetails.push(
        <div className="userDetail_one_line" key={key}>
          <span className="userDetail_key">{key}: </span>
          <span className="userDetail_value">{value}</span>
        </div>
      )
    }
    return userDetails;
  }

  // helper function, called by render() to add link to photos when user is not undefined.
  linkToPhotos() {
    if (this.state.user !== undefined) {
      return <Link className="userDetail_link" to={"/photos/" + this.state.user._id}>
        Link to photos of this user
      </Link>;
    }

  }
  render() {
    return (
      <div>
        {this.displayUserDetails.bind(this)()}

        {this.linkToPhotos()}
      </div>
    );
  }
}

export default UserDetail;
