import os

class Config:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Goes up to project root
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASE_DIR, "orderbook.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False