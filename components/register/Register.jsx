import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button
}
  from '@material-ui/core';
import './Register.css';
import axios from 'axios';
// const axios = require('axios');

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registerPostURL: "/user",//used when POST

      login_name: "",
      login_name_err: "",

      password: "",
      password_err: "",

      passwordValidation: "",
      passwordValidation_err: "",

      first_name: "",
      first_name_err: "",

      last_name: "",
      last_name_err: "",

      location: "",
      description: "",
      occupation: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateIt = this.validateIt.bind(this);
  }

  //handle input change:
  //The login_name, first_name, last_name, and password must be non-empty strings
  //password and passeordValidation must be identical
  handleChange(e) {
    e.preventDefault();
    let { ...states } = this.state;//destructuring
    let errors = {};
    const { name, value } = e.target;
    switch (name) {
      case "first_name":
        errors.first_name_err = value ? "" : "first name can not be empty";
        break;
      case "last_name":
        errors.last_name_err = value ? "" : "last name can not be empty";
        break;
      case "login_name":
        errors.login_name_err = value ? "" : "login name can not be empty";
        break;
      case "password":
        errors.password_err = value ? "" : "password can not be empty";
        break;
      case "passwordValidation":
        errors.passwordValidation_err = value == states.password ? "" : "not the same as password";
        break;
    }
    this.setState({
      [name]: value,
      ...errors
    });
  }

  //helper function called by handleSubmit()
  //check whether all the error message is empty (means no error)
  validateIt() {
    let isError = false;
    if (this.state.login_name_err || this.state.first_name_err || this.state.last_name_err ||
      this.state.password_err || this.state.passwordValidation_err) {
      isError = true;
    }
    return isError;
  }


  handleSubmit(e) {
    e.preventDefault();//stop DOM from generating a POST
    let isError = this.validateIt();
    if (isError) {
      //form is invalid
      console.log("Can not register due to invalid information.")
    } else {
      //form is valid
      axios.post(this.state.registerPostURL, {
        login_name: this.state.login_name,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        password: this.state.password,
        passwordValidation: this.state.passwordValidation,
        location: this.state.location,
        description: this.state.description,
        occupation: this.state.occupation
      }).then(() => {
        //clear input field
        var inputs = document.getElementsByClassName("Register_input_field");
        for (let i = 0; i < inputs.length; i++) {
          inputs[i].value = "";
        }
        //clear state
        this.setState({
          login_name: "",
          login_name_err: "",

          password: "",
          password_err: "",

          passwordValidation: "",
          passwordValidation_err: "",

          first_name: "",
          first_name_err: "",

          last_name: "",
          last_name_err: "",

          location: "",
          description: "",
          occupation: ""
        })
        alert("Register successfully!")
      }).catch(err => {
        alert(err.response.data);
      });
    }
  }

  render() {
    const { ...states } = this.state;//destructuring
    return (
      <div>
        <div className="Register_container">
          <form onSubmit={this.handleSubmit}>
            <div className="Register_first_name">
              <label htmlFor="first_name">First Name * </label>
              <input
                className={states.first_name_err.length > 0 ? "error" : "Register_input_field"}
                type="text"
                name="first_name"
                onChange={this.handleChange} />
              {states.first_name_err.length > 0 && (
                <span className="Register_errorMessage">{states.first_name_err}</span>)}
            </div>
            <div className="Register_last_name">
              <label htmlFor="last_name">Last Name * </label>
              <input
                className={states.last_name_err.length > 0 ? "error" : "Register_input_field"}
                type="text"
                name="last_name"
                onChange={this.handleChange} />
              {states.last_name_err.length > 0 && (
                <span className="Register_errorMessage">{states.last_name_err}</span>)}
            </div>
            <div className="Register_login_name">
              <label htmlFor="login_name">Login Name * </label>
              <input
                className={states.login_name_err.length > 0 ? "error" : "Register_input_field"}
                type="text"
                name="login_name"
                onChange={this.handleChange} />
              {states.login_name_err.length > 0 && (
                <span className="Register_errorMessage">{states.login_name_err}</span>)}
            </div>
            <div className="Register_location">
              <label htmlFor="location">Location </label>
              <input
                type="text"
                name="location"
                className="Register_input_field"
                onChange={this.handleChange} />
            </div>
            <div className="Register_description">
              <label htmlFor="description">Description </label>
              <input
                type="text"
                name="description"
                className="Register_input_field"
                onChange={this.handleChange} />
            </div>
            <div className="Register_occupation">
              <label htmlFor="occupation">Occupation </label>
              <input
                type="text"
                name="occupation"
                className="Register_input_field"
                onChange={this.handleChange} />
            </div>
            <div className="Register_password">
              <label htmlFor="password">Passward * </label>
              <input
                className={states.password_err.length > 0 ? "error" : "Register_input_field"}
                type="password"
                name="password"
                onChange={this.handleChange} />
              {states.password_err.length > 0 && (
                <span className="Register_errorMessage">{states.password_err}</span>)}
            </div>
            <div className="Register_passwordValidation">
              <label htmlFor="passwordValidation">Password Validation * </label>
              <input
                className={states.passwordValidation_err.length > 0 ? "error" : "Register_input_field"}
                type="password"
                name="passwordValidation"
                onChange={this.handleChange} />
              {states.passwordValidation_err.length > 0 && (
                <span className="Register_errorMessage">{states.passwordValidation_err}</span>)}
            </div>

            <Button
              variant="contained"
              className="Register_register_button"
              color="secondary"
              size="small"
              type="submit">Register Me</Button>
          </form>
        </div>
        <Link
          className="Register_link_to_login"
          to="/login-register"
        >Already has an account? Click here to login.</Link>
      </div>
    );
  }
}

export default Register;