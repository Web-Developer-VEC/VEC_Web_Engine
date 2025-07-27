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

def insert_about_us():
    collection = db['about_us']

    with open("/VEC_WEB_Engine/docs/about_us.json", "r", encoding="utf-8") as file:
        data = json.load(file)
        top_level = data[0]

        documents = []
        for key, value in top_level.items():
            documents.append({
                "_id": key,
                "section": key,
                "content": value
            })

        collection.insert_many(documents)
    print("about_us documents inserted successfully.\n")

insert_about_us()