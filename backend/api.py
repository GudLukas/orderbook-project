from flask import Flask
from flask_cors import CORS
from routes import bp

app = Flask(__name__)

"""
CORS (Cross-Origin Resource Sharing) is enabled for the Flask app to allow requests from the frontend.

A web page at http://localhost:8000 (your frontend)
Cannot make requests to http://localhost:5000 (your Flask API)
Because they have different ports (different origins)

CORS resolves this by allowing the frontend to access the backend API.
"""

CORS(app)
app.register_blueprint(bp)

if __name__ == '__main__':
    app.run(debug=True)