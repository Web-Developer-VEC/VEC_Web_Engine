import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "TEST"

client = MongoClient(mongo_uri)
db = client[db_name]


def insert_about_us():
    collection = db["about_us"]

    with open("/VEC_Web_Engine/Backend_Deployment/docs/about_us.json", "r", encoding="utf-8") as file:
        about_data = json.load(file)

        for section in about_data:
            section_type = section["type"]
            document = {
                "type": section_type,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("about_us sections inserted successfully.")


def insert_administration_sections():
    collection = db["administration"]

    with open("/VEC_Web_Engine/Backend_Deployment/docs/administration.json", "r", encoding="utf-8") as file:
        admin_data = json.load(file)

        for section in admin_data:
            section_type = section["type"]
            document = {
                "type": section_type,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("Administration sections inserted successfully.")

insert_administration_sections()
