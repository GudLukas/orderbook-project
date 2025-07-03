from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "<h1>Hello, Orderbook!</h1>" \
    "<p>Welcome to the Orderbook application.</p>"

if __name__ == "__main__":
    app.run(debug=True)