# for reusing existing connections / limiting total connections
# leading to better performance

import mysql.connector.pooling
from contextlib import contextmanager
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

pool_config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'orderbook_db'),
    'pool_name': 'orderbook_pool',
    'pool_size': 10, # number of connections in the pool - depends on the needs, can be adjusted for scalability
    'pool_reset_session': True,
    'autocommit': False
}

try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(**pool_config)
except mysql.connector.Error as err:
    logging.error(f"Error creating connection pool: {err}")
    raise

@contextmanager
def get_db_connection():
    connection = None
    try:
        connection = connection_pool.get_connection()
        yield connection
    except mysql.connector.Error as err:
        if connection:
            connection.rollback()
        logging.error(f"Database error: {err}")
        raise
    finally:
        if connection and connection.is_connected():
            connection.close()