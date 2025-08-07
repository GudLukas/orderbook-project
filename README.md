# Real-Time Order Book Platform

## Introduction

A financial order book system, dedicated primarily for the front office of an investment bank.

Our solution provides a backend API that allows management of orders & execution of trades.

Additionally, the system utilises React-based frontend and an SQL database to deliver its outcome.

## Our Goal

Aiming to provide a robust, scalable, and customisable orderbook solution, and offering management through our API.

Build a foundation for more advanced analytics through AI driven support in the future.

## Audience

Primary - front office teams at investment banks.

Secondary - developers seeking out a flexible foundation for custom trading tools and analytics.

## How To Run

Follow these steps to set up the project locally.

---

### Database

1. **Create the `database`** using this **[script](/database/orderbook-schema.sql)** in `/database` directory.

---

### Backend

1. **Create a `.env` file** in the `/backend` directory:
   ```ini
   JWT_SECRET=your_jwt_secret
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   ```

2. Set up a `virtual environment` and install `dependencies`:
    ```ini
    cd backend
    python -m venv .venv
    # activate the virtual environment (CTRL + SHIFT + P -> Python: Select Interpreter)
    # may require a new terminal
    pip install -r requirements.txt
    ```

3. Run the `API`:
    ```bash
    python api.py
    ```

---

### Frontend

1. Install `dependencies`:
    ```ini
    cd frontend/orderbook
    npm install
    ```
    
2. Run the `application`:
    ```ini
    npm run dev