import React, { Component } from "react";
import FileUploadDialog from "./FileUploadDialog";

//import FileUploadDialog from "./DropZoneUploader";

export default class SlideContents extends Component {
  state = {
    IsPopupDialog: false
  };  
      
  togglePopUp = () => {
    this.setState({
      IsPopupDialog: !this.state.IsPopupDialog
    });
  };
  
  render() {
    return (
      <div className="slide-opacity">
        <div className="slide-contents-wrap">
          <div className="slide-contents">
            <p className="site-description">
              Use cloud storage<br/>
              Share movies with a friend or Make your business easier
            </p>
            <div className="btn-select-movie" onClick={this.togglePopUp}>
              Select Movie
            </div>
          </div>
        </div>
        {this.state.IsPopupDialog ? <FileUploadDialog toggle={this.togglePopUp}/> : null}
      </div>
    );
  }
}

