import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"

client = MongoClient(mongo_uri)
db = client[db_name]

import json
from pymongo import MongoClient

def insert_administration_sections():
    collection = db["administration"]

    with open("/root/VEC_Web_Engine/docs/administration.json", "r", encoding="utf-8") as file:
        admin_data = json.load(file)

        for section in admin_data:
            section_key = list(section.keys())[0]
            document = {
                "type": section_key,
                "data": section[section_key]
            }
            collection.insert_one(document)

    print("Administration sections inserted successfully.")

insert_administration_sections()