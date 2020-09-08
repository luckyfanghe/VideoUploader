import qq from 'fine-uploader/lib/dnd'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { invalid_file_format } from '../actions'
import { DROPZONE_VIDEO } from '../constants/actionTypes'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class DropzoneElement extends Component {
    static propTypes = {
        children: PropTypes.node,
        dropActiveClassName: PropTypes.string,
        element: PropTypes.object,
        multiple: PropTypes.bool,
        onDropError: PropTypes.func,
        onProcessingDroppedFiles: PropTypes.func,
        onProcessingDroppedFilesComplete: PropTypes.func,
        uploader: PropTypes.object.isRequired
    };

    static defaultProps = {
        dropActiveClassName: 'react-fine-uploader-dropzone-active'
    }

    componentDidMount() {
        this._registerDropzone()
    }

    componentDidUpdate() {
        this._registerDropzone()
    }

    componentWillUnmount() {
        this._qqDropzone && this._qqDropzone.dispose()
    }

    render() {
        const { uploader, ...elementProps } = this.props // eslint-disable-line no-unused-vars

        return (
            <div { ...getElementProps(this.props) }
                className={`fine-uploader-dropzone-container ${this.props.className || ''}`}
                 ref='dropZone'
            >
                { this.props.children }
            </div>
        )
    }

    _onDropError(errorCode, errorData) {
        console.error(errorCode, errorData)

        this.props.onDropError && this.props.onDropError(errorCode, errorData)
    }

    _onProcessingDroppedFilesComplete(files) {
        if (this.props.onProcessingDroppedFilesComplete) {
            const target_obj = this.props.onProcessingDroppedFilesComplete(files)
            if(target_obj.dropzone != DROPZONE_VIDEO) {
                let img = new Image();
                img.src = window.URL.createObjectURL(files[0]);
        
                img.onload = () => {
                    console.log(img.width, img.height)
        
                    if(img.width === target_obj.width && img.height === target_obj.height) {
                        this.props.uploader.methods.addFiles(files)
                    } else {
                        this.props.invalid_file_format(target_obj.dropzone)
                        //alert(`The dimensions of your image are not correct. Please add a new image.`);
                    }                
                }
                img.onerror = () => {
                    this.props.invalid_file_format(target_obj.dropzone)
                    //alert("Invalid image file format");
                }

                return;

            } else {
                let ext = files[0].name.split('.').pop();
                if(ext != 'mov') {
                    this.props.invalid_file_format(target_obj.dropzone)
                    return;
                }
            }
        } 

        this.props.uploader.methods.addFiles(files)
    }

    _registerDropzone() {
        this._qqDropzone && this._qqDropzone.dispose()

        const dropzoneEl = this.props.element || this.refs.dropZone

        this._qqDropzone = new qq.DragAndDrop({
            allowMultipleItems: !!this.props.multiple,
            callbacks: {
                dropError: this._onDropError.bind(this),
                processingDroppedFiles: this.props.onProcessingDroppedFiles || function() {},
                processingDroppedFilesComplete: this._onProcessingDroppedFilesComplete.bind(this)
            },
            classes: {
                dropActive: this.props.dropActiveClassName || ''
            },
            dropZoneElements: [dropzoneEl]
        })
    }
}

const getElementProps = actualProps => {
    const actualPropsCopy = { ...actualProps }
    const expectedPropNames = Object.keys(DropzoneElement.propTypes)

    expectedPropNames.forEach(expectedPropName => delete actualPropsCopy[expectedPropName])
    return actualPropsCopy
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ invalid_file_format }, dispatch);
}

export default connect(null, { invalid_file_format })(DropzoneElement);