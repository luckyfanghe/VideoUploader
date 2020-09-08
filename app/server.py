#!/usr/bin/env python
import json
import os
import os.path
import shutil
import sys

from videoprops import get_video_properties
from flask import current_app, Flask, jsonify, render_template, request
from flask.views import MethodView

# Meta
##################
__version__ = '0.1.0'

# Config
##################
DEBUG = True
SECRET_KEY = 'development key'

BASE_DIR = os.path.dirname(__file__)

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
UPLOAD_DIRECTORY = os.path.join(MEDIA_ROOT, 'upload')
CHUNKS_DIRECTORY = os.path.join(MEDIA_ROOT, 'chunks')

app = Flask(__name__)
app.config.from_object(__name__)

# Utils
##################
def make_response(status=200, content=None):
    """ Construct a response to an upload request.
    Success is indicated by a status of 200 and { "success": true }
    contained in the content.

    Also, content-type is text/plain by default since IE9 and below chokes
    on application/json. For CORS environments and IE9 and below, the
    content-type needs to be text/html.
    """
    #return current_app.response_class(json.dumps(content,
    #    indent=None if request.is_xhr else 2), mimetype='text/plain')

    return current_app.response_class(json.dumps(content, indent=None), mimetype='text/plain')


def validate(attrs):
    """ No-op function which will validate the client-side data.
    Werkzeug will throw an exception if you try to access an
    attribute that does not have a key for a MultiDict.
    """
    try:
        #required_attributes = ('qquuid', 'qqfilename')
        #[attrs.get(k) for k,v in attrs.items()]
        return True
    except Exception as e:
        return False


def handle_delete(uuid):
    """ Handles a filesystem delete based on UUID."""
    location = os.path.join(app.config['UPLOAD_DIRECTORY'], uuid)
    print(uuid)
    print(location)
    shutil.rmtree(location)

def handle_upload(f, attrs):
    """ Handle a chunked or non-chunked upload.
    """

    chunked = False
    chunk_check_index = 1
    dest_folder = os.path.join(app.config['UPLOAD_DIRECTORY'], attrs['qquuid'])
    dest = os.path.join(dest_folder, attrs['qqfilename'])

    # Chunked
    if int(sys.version[:1]) >= 3:
        if 'qqtotalparts' in attrs and int(attrs['qqtotalparts']) > 1:
            chunked = True
            dest_folder = os.path.join(app.config['CHUNKS_DIRECTORY'], attrs['qquuid'])
            dest = os.path.join(dest_folder, attrs['qqfilename'], str(attrs['qqpartindex']))
    else:
        if attrs.has_key('qqtotalparts') and int(attrs['qqtotalparts']) > 1:
            chunked = True
            dest_folder = os.path.join(app.config['CHUNKS_DIRECTORY'], attrs['qquuid'])
            dest = os.path.join(dest_folder, attrs['qqfilename'], str(attrs['qqpartindex']))

    if chunked == False or (chunked and (int(attrs['qqpartindex']) == 0)):
        try:
            file_extension = attrs['qqfilename'].split(".")[-1]
            ["apng", "bmp", "jpg", "jpeg", "png", "svg", "gif"].index(file_extension)
        except ValueError:
            blob = f.read()
            count = blob.count(b'\x69\x63\x70\x66')
            if (count > 1):
                print ('find -- codec prores --', 'frame counts:', count)
            else:
                print ('Not prores frame', 'frame counts:', count)
                return False

    save_upload(f, dest)
    '''
    if chunked and (int(attrs['qqpartindex']) == chunk_check_index):
        if not check_video_validation(chunk_check_index + 1, source_folder=os.path.dirname(dest)):
            return False
	'''
    if chunked and (int(attrs['qqtotalparts']) - 1 == int(attrs['qqpartindex'])):

        combine_chunks(attrs['qqtotalparts'],
            attrs['qqtotalfilesize'],
            source_folder=os.path.dirname(dest),
            dest=os.path.join(app.config['UPLOAD_DIRECTORY'], attrs['qquuid'],
                attrs['qqfilename']))

        shutil.rmtree(os.path.dirname(os.path.dirname(dest)))

    return True

def check_video_validation(total_parts, source_folder):
    """ combine a chunked file to check validation of proRes video.
    """

    dest = os.path.join(source_folder, 'video_chunk')

    with open(dest, 'wb+') as destination:
        if int(sys.version[:1]) >= 3:
            for i in range(int(total_parts)):
                part = os.path.join(source_folder, str(i))
                with open(part, 'rb') as source:
                    destination.write(source.read())
        else:
            for i in xrange(int(total_parts)):
                part = os.path.join(source_folder, str(i))
                with open(part, 'rb') as source:
                    destination.write(source.read())

    try:
        props = get_video_properties(dest)
        print (props)

        if props['codec_name'] == 'proRes':
            return True

    except Exception as e:
        print(e)

    return False

def save_upload(f, path):
    """ Save an upload.
    Uploads are stored in media/uploads
    """
    if not os.path.exists(os.path.dirname(path)):
        os.makedirs(os.path.dirname(path))
    with open(path, 'wb+') as destination:
        destination.write(f.read())


def combine_chunks(total_parts, total_size, source_folder, dest):
    """ Combine a chunked file into a whole file again. Goes through each part
    , in order, and appends that part's bytes to another destination file.

    Chunks are stored in media/chunks
    Uploads are saved in media/uploads
    """

    if not os.path.exists(os.path.dirname(dest)):
        os.makedirs(os.path.dirname(dest))

    with open(dest, 'wb+') as destination:
        if int(sys.version[:1]) >= 3:
            for i in range(int(total_parts)):
                part = os.path.join(source_folder, str(i))
                with open(part, 'rb') as source:
                    destination.write(source.read())
        else:
            for i in xrange(int(total_parts)):
                part = os.path.join(source_folder, str(i))
                with open(part, 'rb') as source:
                    destination.write(source.read())


# Views
##################
@app.route("/")
def index():
    """ The 'home' page. Returns an HTML page with Fine Uploader code
    ready to upload. This HTML page should contain your client-side code
    for instatiating and modifying Fine Uploader.
    """
    return render_template('index.html')


class UploadAPI(MethodView):
    """ View which will handle all upload requests sent by Fine Uploader.

    Handles POST and DELETE requests.
    """

    def post(self):
        """A POST request. Validate the form and then handle the upload
        based ont the POSTed data. Does not handle extra parameters yet.
        """
        if validate(request.form):
            if(handle_upload(request.files['qqfile'], request.form)):
                return make_response(200, { "success": True })
            else:
                return make_response(400, { "success": False, "error": "Invalid video", "preventRetry": True, "reset": True })

        return make_response(400, { "success": False, "error": "Invalid request" })

    def delete(self, uuid):
        """A DELETE request. If found, deletes a file with the corresponding
        UUID from the server's filesystem.
        """
        try:
            handle_delete(uuid)
            return make_response(200, { "success": True })
        except Exception as e:
            return make_response(400, { "success": False, "error": e.message })

upload_view = UploadAPI.as_view('upload_view')
app.add_url_rule('/upload', view_func=upload_view, methods=['POST',])
app.add_url_rule('/upload/<uuid>', view_func=upload_view, methods=['DELETE',])


# Main
##################
def main():
    app.run('0.0.0.0')
    return 0

if __name__ == '__main__':
    status = main()
    sys.exit(status)
