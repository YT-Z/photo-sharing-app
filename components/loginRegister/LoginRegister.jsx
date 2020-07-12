import React from 'react';
import { Link } from 'react-router-dom';
import {
    Button
}
    from '@material-ui/core';
import './LoginRegister.css';
import axios from 'axios';
// const axios = require('axios');
//login
class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginRegisterPostURL: "/admin/login",//used when POST

            login_name: "",
            login_name_err: "",

            password: "",
            password_err: ""
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
        let errors = {};
        const { name, value } = e.target;
        switch (name) {
            case "login_name":
                errors.login_name_err = value ? "" : "loginRegister name can not be empty";
                break;
            case "password":
                errors.password_err = value ? "" : "password can not be empty";
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
        if (this.state.login_name_err || this.state.password_err) {
            isError = true;
        }
        return isError;
    }


    handleSubmit(e) {
        e.preventDefault();//stop DOM from generating a POST
        let isError = this.validateIt();
        if (isError) {
            //form is invalid
            console.log("Not valid loginRegister information, please try again.")
        } else {
            //form is valid

            axios.post(this.state.loginRegisterPostURL, {
                login_name: this.state.login_name,
                password: this.state.password
            }).then(response => {
                //clear input field
                var inputs = document.getElementsByClassName("loginRegister_input_field");
                for (let i = 0; i < inputs.length; i++) {
                    inputs[i].innerHTML = "";
                }
                //clear state
                this.setState({
                    login_name: "",
                    login_name_err: "",

                    password: "",
                    password_err: ""
                })

                //pass login state to photoShare.jsx
                this.props.loginHandler(true, response.data._id, response.data.first_name, response.data.last_name);

            }).catch(err => {
                alert(err.response.data);
            });
        }
    }

    render() {
        const { ...states } = this.state;//destructuring
        return (
            <div>
                <div className="loginRegister_container">
                    <form onSubmit={this.handleSubmit}>

                        <div className="loginRegister_login_name">
                            <label htmlFor="login_name">Login Name * </label>
                            <input
                                className={states.login_name_err.length > 0 ? "error" : "loginRegister_input_field"}
                                type="text"
                                name="login_name"
                                onChange={this.handleChange} />
                            {states.login_name_err.length > 0 && (
                                <span className="loginRegister_errorMessage">{states.login_name_err}</span>)}
                        </div>

                        <div className="loginRegister_password">
                            <label htmlFor="password">Passward * </label>
                            <input
                                className={states.password_err.length > 0 ? "error" : "loginRegister_input_field"}
                                type="password"
                                name="password"
                                onChange={this.handleChange} />
                            {states.password_err.length > 0 && (
                                <span className="loginRegister_errorMessage">{states.password_err}</span>)}
                        </div>


                        <Button
                            variant="contained"
                            className="loginRegister_button"
                            color="secondary"
                            size="small"
                            type="submit">Login</Button>
                    </form>
                </div>
                <Link
                    className="loginRegister_link_to_register"
                    to="/register"
                >Don not have an account? Click here to register.</Link>
            </div>
        );
    }
}

export default LoginRegister;

