import os
from flask import Flask
from flask import request
from flask import jsonify
from google.appengine.ext.db import BadValueError

import model

app = Flask(__name__)

IS_PROD = os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/')
app.config['DEBUG'] = not IS_PROD


class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route('/record', methods=['POST'])
def record_action():
    data = request.get_json()
    try:
        response = model.Actions(**data)
    except AttributeError as e:
        raise InvalidUsage(str(e), status_code=400)
    except BadValueError as e:
        raise InvalidUsage(str(e), status_code=400)
    response.put()
    return jsonify(dict(message='success'))
