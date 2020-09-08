import React, { Component } from "react";
import FineUploaderTraditional from 'fine-uploader-wrappers'
import Dropzone from './DropZone'
import { initalize_dropstore, invalid_file_format } from '../actions'
import Thumbnail from 'react-fine-uploader/thumbnail'
import ProgressBar from 'react-fine-uploader/progress-bar'
import { connect } from 'react-redux';


import { DROPZONE_POSTER1, DROPZONE_POSTER2, DROPZONE_VIDEO } from '../constants/actionTypes'

const uploader = new FineUploaderTraditional({
  options: {
      //autoUpload:false,
      chunking: {
          enabled: true
      },
      deleteFile: {
          enabled: true,
          endpoint: '/upload'
      },
      request: {
          endpoint: '/upload'
      },
      retry: {
          enableAuto: true
      },
    //   validation: {
    //     allowedExtensions: ['jpeg', 'jpg'],
    //     image:{
    //       minHeight: 300,
    //       minWidth: 300
    //     }
    //   },
    //   messages: {
    //     typeError: '{file} has an invalid extension. Valid extension(s): {extensions}.'
    //     // other messages can go here as well ...
    //   },
      // callbacks: {
      //   onSubmit: function(id, file_name) {
      //     return true
      //   },
      //   onValidateBatch: function(data, button_container) {
      //     return true
      //   },
      //   onError: function(id, name, errorReason, xhrOrXdr) {
      //     alert(qq.format("Error on file number {} - {}.  Reason: {}", id, name, errorReason));
      //   }
      // }
  }
})

class FileUploadDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      submittedFiles: [],
      dropzone_index: 0,
      dropzone_file_ids: [-1, -1, -1], 
      video_player_mode: false
    }
  }

  componentDidMount() {

    this.setState({ dropzone_file_ids: [-1, -1, -1], video_player_mode: false })
    this.props.initalize_dropstore()

    uploader.on('statusChange', (id, oldStatus, newStatus) => {
      console.log(id, oldStatus, newStatus)
      if (newStatus === 'submitted') {
          const submittedFiles = this.state.submittedFiles

          submittedFiles.push(id)
          this.setState({ submittedFiles })

          const newItems = [...this.state.dropzone_file_ids];
          newItems[this.state.dropzone_index] = id;
          this.setState({ dropzone_file_ids: newItems });
      }
      else if (isFileGone(newStatus)) {
          const submittedFiles = this.state.submittedFiles
          const indexToRemove = submittedFiles.indexOf(id)

          submittedFiles.splice(indexToRemove, 1)
          this.setState({ submittedFiles })
      }
      else if (newStatus === "upload successful"|| newStatus === "upload failed") {
        if (newStatus === "upload successful") {
            // const submittedFiles = this._findFileIndex(id)
            // if (submittedFiles < 0) {
            //   submittedFiles.push({ id, fromServer: true })
            // }
            
            if(this.state.dropzone_index == DROPZONE_VIDEO)
              this.setState({video_player_mode : true})
        }
        if (newStatus === "upload failed") {
          this.props.invalid_file_format(this.state.dropzone_index)

          const newItems = [...this.state.dropzone_file_ids];
          newItems[this.state.dropzone_index] = -1;
          this.setState({ dropzone_file_ids: newItems });

          if(this.state.dropzone_index == DROPZONE_VIDEO)
            this.setState({video_player_mode : false})
        }
        this._updateSubmittedFileStatus(id, status)
      }
    })
  }

  componentWillReceiveProps(nextProps)
  {
    console.log('componentWillReceiveProps', nextProps);
  }

  componentDidUpdate(prevProps)
  {
    console.log('componentDidUpdate', prevProps);
  }

  handleClick = () => {
    this.props.toggle();
  };

  _updateSubmittedFileStatus(id, status) {
    this.state.submittedFiles.some(file => {
        if (file.id === id) {
            file.status = status
            this.setState({ submittedFiles: this.state.submittedFiles })
            return true
        }
    })
  }


  processingDroppedFilesComplete = (files, dropzone) => {
    var file_info = {}
    switch(dropzone)
    {
      case DROPZONE_POSTER1:
        file_info = {dropzone:dropzone, width:2100, height:1400};
        break
      case DROPZONE_POSTER2:
        file_info = {dropzone:dropzone, width:1600, height:2400};
        break
      case DROPZONE_VIDEO:
        file_info = {dropzone:dropzone};
        this.setState({video_player_mode : false})
        break
    }

    this.setState({ dropzone_index: dropzone })

    if (this.state.dropzone_file_ids[dropzone] != -1) {
      uploader.methods.deleteFile(this.state.dropzone_file_ids[dropzone])

      const newItems = [...this.state.dropzone_file_ids];
      newItems[dropzone] = -1;
      this.setState({ dropzone_file_ids:newItems });
    }
    
    return file_info;

    //let res = getImage(window.URL.createObjectURL(files[0])).then;

    // getImage(window.URL.createObjectURL(files[0])).then(function(successUrl){
    //   res = true
    // }).catch(function(errorUrl){
    //   res = false
    // })

    //uploader.qq.basePublicApi.uploads
    /*let img = new Image();
    img.src = window.URL.createObjectURL(files[0]);

    img.onload = () => {
      let img_width = 2100;
      let img_height = 1600;

      if(img.width === img_width && img.height === img_height) {
      } else {
        //uploader.qq.reset();
        //alert(`The dimensions of your image are not correct. Please add a new image.`);
      }                
    }
    img.onerror = () => {
      alert("Invalid image file format");
    }*/

    return 
  };

  render() {
    return (
      <div className="modal">
        <div className="modal-main">
          <div className="modal-title">
            Deliver your media
            <span className="close-popup" onClick={this.handleClick}> &times; </span>
          </div>
          <hr/>
          <div className="modal-text">
            In order for Tell the World to be distributed, you must upload three assets: artwork in two different size,
            and your video file, We will now guid  you through this process.
          </div>
          <div className="modal-contents">
            <Dropzone 
              className="f-poster1"
              multiple={false}
              onProcessingDroppedFilesComplete={(files) => this.processingDroppedFilesComplete(files, DROPZONE_POSTER1)}
              uploader={uploader}
              >
              {(this.state.submittedFiles.length == 0 || this.state.dropzone_file_ids[DROPZONE_POSTER1] == -1) ? (
                ( this.props.poster1_file_error == true ) ? (
                  <div className="drag-drop-region invalid-file">Drag file here</div>
                ) : (
                  <div className="drag-drop-region">Drag file here</div>
                )
              ) : (
                <Thumbnail className="f-poster1-thumbnail" id={ this.state.dropzone_file_ids[DROPZONE_POSTER1] } uploader={ uploader } />
              )}
              <div>2100 x 1400 Poster</div>
            </Dropzone>

            <Dropzone 
              className="f-video"
              multiple={false}
              onProcessingDroppedFilesComplete={(files) => this.processingDroppedFilesComplete(files, DROPZONE_VIDEO)}
              uploader={uploader}
              >
              {(this.state.submittedFiles.length == 0 || this.state.dropzone_file_ids[DROPZONE_VIDEO]== -1) ? (
                ( this.props.video_file_error == true ) ? (
                  <div className="drag-drop-region invalid-file">Drag file here</div>
                ) : (
                  <div className="drag-drop-region">Drag file here</div>
                )
              ) : (
                ( this.state.video_player_mode) ? (
                  <div className="drag-drop-region video-player-mode">.</div>
                ) : (
                  <div>
                    <Thumbnail className="f-poster2-thumbnail" id={ this.state.dropzone_file_ids[DROPZONE_VIDEO] } uploader={ uploader }/>
                    <ProgressBar className="progress-bar" id={ this.state.dropzone_file_ids[DROPZONE_VIDEO] } uploader={ uploader }/>
                  </div>
                )
              )}
              <div>ProRes 422 Video File</div>
            </Dropzone>
            
            <Dropzone 
              className="f-poster2"
              multiple={false}

              onProcessingDroppedFilesComplete={(files) => this.processingDroppedFilesComplete(files, DROPZONE_POSTER2)}
              uploader={uploader}
              >
              {(this.state.submittedFiles.length == 0 || this.state.dropzone_file_ids[DROPZONE_POSTER2] == -1) ? (
                ( this.props.poster2_file_error == true ) ? (
                  <div className="drag-drop-region invalid-file">Drag file here</div>
                ) : (
                  <div className="drag-drop-region">Drag file here</div>
                )
              ) : (
                <Thumbnail className="f-poster3-thumbnail" id={ this.state.dropzone_file_ids[DROPZONE_POSTER2] } uploader={ uploader } fromServer = {false} />
              )}
              <div>1600 x 2400 Poster</div>
            </Dropzone>
          </div>
        </div>
      </div>
    )
  }
}

const isFileGone = status => {
  return [
      'canceled',
      'deleted',
  ].indexOf(status) >= 0
}

function mapStateToProps(state) {
  console.log(state.poster1_file_error, state.video_file_error, state.poster2_file_error)
  return {
    poster1_file_error: state.poster1_file_error,
    video_file_error: state.video_file_error,
    poster2_file_error: state.poster2_file_error
  };
}

export default connect(mapStateToProps, { initalize_dropstore, invalid_file_format })(FileUploadDialog);
