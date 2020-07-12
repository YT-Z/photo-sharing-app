import React from 'react';
import {
    Divider,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography
} from '@material-ui/core';
import Modal from 'react-modal';
import './FavoritePhotos.css';
import ClearIcon from '@material-ui/icons/Clear';
import axios from 'axios';


//make sure to bind modal to appElement
Modal.setAppElement(document.getElementById('photoshareapp'));

class FavoritePhotos extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //list of favorite photos. a photo object has attributes 
            // of file_name, date_time, _id
            favoritePhotos: [],
            modalImageName: "",
            modalImageCaption: "",
            modalIsOpen: false
        }
        this.onDelecte = this.onDelete.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentDidMount() {
        //initiate favorite photos list
        axios.get('/favorites').then(response => {
            this.setState({
                favoritePhotos: response.data
            })
            return axios.get('/login-user-name');
        }).then((userName) => {
            // update right bar
            var value = "Favorites of " + userName.data;
            this.props.handler(value);
        }).catch(error => {
            console.log(error);
        });
    }

    //called when an image is clicked, open modal with the given index of image in favoritePhotos list
    openModal(i) {
        this.setState({
            modalIsOpen: true,
            modalImageName: this.state.favoritePhotos[i].file_name,
            modalImageCaption: "Photo uploaded on " + this.state.favoritePhotos[i].date_time
        });
    }

    closeModal() {
        this.setState({
            modalIsOpen: false,
            modalImageName: "",
            modalImageCaption: ""
        })

    }

    //delete the photo with given id on server side. called when the clearButton is clicked.
    onDelete(e, id) {
        e.preventDefault();
        let toDelete_id = this.state.favoritePhotos[id]._id;
        console.log("toDelete", toDelete_id);
        axios.post("/delete-favorite", { _id: toDelete_id }).then(() => {
            console.log("deleted success");
            return axios.get('/favorites');
        }).then(response => {
            this.setState({
                favoritePhotos: response.data
            });
        }).catch(error => {
            alert(error.response.data);
        })

    }

    //helper function called by render() to display favorite photos 
    displayFavoritePhotos() {
        if (this.state.favoritePhotos.length === 0) {
            return (
                <div className="favoritePhotos_no_favorites">
                    No favorite photos.
                </div>
            )
        } else {
            let favoritePhotosList = [];
            for (let i = 0; i < this.state.favoritePhotos.length; i++) {
                let favoritePhoto_fileName = this.state.favoritePhotos[i].file_name;
                let favoritePhoto_caption = "Photo uploaded on " + this.state.favoritePhotos[i].date_time;
                favoritePhotosList.push(
                    <ListItem className="favoritePhotos_list_item" key={i} id={i}>
                        <img
                            className="favoritePhotos_photo_thumbnail"
                            src={"../images/" + favoritePhoto_fileName}
                            onClick={() => this.openModal(i)}
                        />

                        <Modal
                            className="favoritePhotos_modal"
                            isOpen={this.state.modalIsOpen}
                            onRequestClose={this.closeModal}
                            shouldCloseOnOverlayClick={true}
                        >
                            <img
                                className="favoritePhotos_photo_modal"
                                src={"../images/" + this.state.modalImageName} />
                            <Typography>{this.state.modalImageCaption}</Typography>
                        </Modal>

                        <ListItemText className="favoritePhotos_list_item_text" primary={favoritePhoto_caption} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={(e) => this.onDelete(e, i)}>
                                <ClearIcon />
                            </IconButton>
                        </ListItemSecondaryAction>


                    </ListItem>
                );
                favoritePhotosList.push(<Divider key={"key" + i} />);
            }
            return favoritePhotosList;
        }

    }

    render() {
        return (
            <div>
                <h2>
                    Your favorite photos:
                </h2>
                {this.displayFavoritePhotos()}
            </div>
        );
    }
}

export default FavoritePhotos;