from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
import logging
from datetime import timedelta
from routes import bp

from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

# Set a consistent JWT secret
JWT_SECRET = os.environ.get(
    "JWT_SECRET", "my_super_secret_jwt_key_for_development_12345"
)

app = Flask(__name__)

# Configure JWT with the SAME secret
app.config["JWT_SECRET_KEY"] = JWT_SECRET
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)

"""
CORS (Cross-Origin Resource Sharing) is enabled for the Flask app to allow requests from the frontend.

A web page at http://localhost:8000 (your frontend)
Cannot make requests to http://localhost:5000 (your Flask API)
Because they have different ports (different origins)

CORS resolves this by allowing the frontend to access the backend API.
"""

CORS(
    app,
    origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
)

logging.basicConfig(level=logging.INFO)

app.register_blueprint(bp)


# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {"message": "Token has expired"}, 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {"message": "Invalid token"}, 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    return {"message": "Authorization token is required"}, 401


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    return False  # For now, don't block any tokens


if __name__ == "__main__":
    app.run(debug=True)
