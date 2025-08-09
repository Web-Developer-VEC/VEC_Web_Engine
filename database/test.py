import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"

client = MongoClient(mongo_uri)
db = client[db_name]

import json
from pymongo import MongoClient


def insert_about_us():
    collection = db["about_us"]

    with open("/root/VEC_Web_Engine/docs/about_us.json", "r", encoding="utf-8") as file:
        about_data = json.load(file)

        for section in about_data:
            section_type = section["type"]
            document = {
                "type": section_type,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("about_us sections inserted successfully.")


insert_about_us()