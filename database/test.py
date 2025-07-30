import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"

client = MongoClient(mongo_uri)
db = client[db_name]

import json
from pymongo import MongoClient

def insert_curriculum_data():
    collection = db['curriculum']
    with open("/VEC-Backend/docs/curriculum.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Curriculum documents inserted successfully.\n")

insert_curriculum_data()