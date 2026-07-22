import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"

client = MongoClient(mongo_uri)
db = client[db_name]

def insert_library_sections():
    collection = db["library"]

    with open("/root/VEC_Web_Engine/Backend/docs/library.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("library sections inserted successfully.")

def insert_sidebar_details():
    collection= db['sidebar']
    with open ("/root/VEC_Web_Engine/Backend/docs/sidebar.json","r",encoding="utf-8") as file:
        documents= json.load(file)
        collection.insert_many(documents)
    print("Sidebar documents inserted successfully\n")


insert_library_sections()
insert_sidebar_details()