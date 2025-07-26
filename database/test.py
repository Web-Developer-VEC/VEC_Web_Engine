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

def insert_web_team():
    collection = db['web_team']
    with open('/VEC-FRONTEND/docs/web_team.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("web team data inserted successfully.")

insert_web_team()