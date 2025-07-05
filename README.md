# Orderbook System

## Introduction

A financial Orderbook System, primarily for the front office of an investment bank.

It will provide a backend API via Flask that will manage buying and selling orders, while providing an ability to view the current state of the orderbook.

The system will later utilise React-based frontend and a database for a more permanent storage solution.

We are also considering ways of using AI for enhanced trading insights and possible automation.

## Our Goal

Aiming to provide a robust, scalable, and customisable orderbook solution, and offering management through our API.

Build a foundation for more advanced analytics through AI driven support.

## Audience

Primary - front office teams at investment banks.

Secondary - developers seeking out a flexible foundation for custom trading tools and analytics.



## Database Integration

This project uses a SQLite database for persistent storage of orders.

The backend is built with Flask and uses [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/) as the ORM for database operations.

- All order data is stored in the `orderbook.db` SQLite database file.
- The database schema is defined in `models.py`.
- API endpoints for creating and retrieving orders are available in `routes.py`.

To initialize the database, simply run the backend server. The tables will be created automatically if they do not exist.


**How to run:**
```sh
pip install -r requirements.txt
cd backend
python api.py
```

You can interact with the API using tools like Postman.  
Example endpoints:
- `POST /orders` to add a new order
- `GET /orders` to list all orders

test