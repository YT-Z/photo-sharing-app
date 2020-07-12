import React from 'react';
import {
    Paper,
    IconButton
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import axios from 'axios';
import './Activities.css';

//show five most recent activities happend on this website
class Activities extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activities: []//five most recent activities
        }
        this.displayActivities = this.displayActivities.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
    }

    componentDidMount() {
        //initiate activities
        axios.get('/activities').then(res => {
            this.setState({
                activities: res.data
            })

            return axios.get('/login-user-name');
        }).then((userName) => {
            // update right bar
            var value = "Activities of " + userName.data;
            this.props.handler(value);
        }).catch(error => {
            console.log(error);
        });
    }

    onRefresh() {
        //update activities
        axios.get('/activities').then(response => {
            this.setState({
                activities: response.data
            })
        }).catch(error => {
            console.log(error);
        });
    }

    //display activities
    displayActivities() {
        let res = [];
        for (let i = 0; i < this.state.activities.length; i++) {
            let activity = this.state.activities[i];
            switch (activity.activity_type) {
                case "register":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_activity">User {activity.user_name} registered </div>
                            <div className="activities_time">{activity.date_time}</div>
                        </Paper>
                    );
                    break;
                case "log in":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_activity">User {activity.user_name} logged in </div>
                            <div className="activities_time">{activity.date_time}</div>
                        </Paper>
                    );
                    break;
                case "log out":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_activity">User {activity.user_name} logged out </div>
                            <div className="activities_time">{activity.date_time}</div>
                        </Paper>
                    );
                    break;
                case "upload":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_horizontal_flex">
                                <div>
                                    <div className="activities_activity">User {activity.user_name} uploaded a photo </div>
                                    <div className="activities_time">{activity.date_time}</div>
                                </div>
                                <img className="activities_photo" src={"../images/" + activity.photo_file_name} />
                            </div>
                        </Paper>

                    );
                    break;
                case "comment":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_horizontal_flex">
                                <div>
                                    <div className="activities_activity">User {activity.user_name} commented on a photo </div>
                                    <div className="activities_time">{activity.date_time}</div>
                                </div>
                                <img className="activities_photo" src={"../images/" + activity.photo_file_name} />
                            </div>
                        </Paper>
                    );
                    break;
                case "like":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_horizontal_flex">
                                <div>
                                    <div className="activities_activity">User {activity.user_name} liked a photo </div>
                                    <div className="activities_time">{activity.date_time}</div>
                                </div>
                                <img className="activities_photo" src={"../images/" + activity.photo_file_name} />
                            </div>
                        </Paper>
                    );
                    break;
                case "unlike":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_horizontal_flex">
                                <div>
                                    <div className="activities_activity">User {activity.user_name} unliked a photo </div>
                                    <div className="activities_time">{activity.date_time}</div>
                                </div>
                                <img className="activities_photo" src={"../images/" + activity.photo_file_name} />
                            </div>
                        </Paper>

                    );
                    break;
                case "favorite":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_horizontal_flex">
                                <div>
                                    <div className="activities_activity">User {activity.user_name} favorited a photo </div>
                                    <div className="activities_time">{activity.date_time}</div>
                                </div>
                                <img className="activities_photo" src={"../images/" + activity.photo_file_name} />
                            </div>
                        </Paper>

                    );
                    break;
                case "unfavorite":
                    res.push(
                        <Paper key={i} className="activities_wrapper">
                            <div className="activities_horizontal_flex">
                                <div>
                                    <div className="activities_activity">User {activity.user_name} unfavorited a photo </div>
                                    <div className="activities_time">{activity.date_time}</div>
                                </div>
                                <img className="activities_photo" src={"../images/" + activity.photo_file_name} />
                            </div>
                        </Paper>

                    );
                    break;

            }

        }
        return res;
    }

    render() {
        return (
            <div>
                <div className="activities_refresh_wrapper">
                    <IconButton
                        color="secondary"
                        className="activities_refresh_icon"
                        onClick={this.onRefresh}
                    >
                        <RefreshIcon />
                    </IconButton>
                </div>

                {this.displayActivities()}
            </div>

        );
    }

}

export default Activities;