import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"

client = MongoClient(mongo_uri)
db = client[db_name]

import json
from pymongo import MongoClient

def insert_research_data():
    collection = db['research_data']
    with open('/VEC_WEB_Engine/docs/research_data.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("Research data inserted successfully.")

insert_research_data()