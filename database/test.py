import json
import os
from pymongo import MongoClient
import pandas as pd
import bcrypt
import requests

mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"

client = MongoClient(mongo_uri)
db = client[db_name]

def create_logs_collection():
    db.create_collection('logs')
    print("logs collection created")

    
create_logs_collection()