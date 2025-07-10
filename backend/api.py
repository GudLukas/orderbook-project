from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import bp

app = Flask(__name__)
app.config.from_object(Config)

"""
CORS (Cross-Origin Resource Sharing) is enabled for the Flask app to allow requests from the frontend.

A web page at http://localhost:8000 (your frontend)
Cannot make requests to http://localhost:5000 (your Flask API)
Because they have different ports (different origins)

CORS resolves this by allowing the frontend to access the backend API.
"""
CORS(app)

db.init_app(app)
app.register_blueprint(bp)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)