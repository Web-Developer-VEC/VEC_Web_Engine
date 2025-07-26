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

def insert_yrc_data():
    collection = db["yrc_data"]
    with open("/VEC-Backend/docs/yrc.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("YRC data inserted successfully.\n")

    
insert_yrc_data()