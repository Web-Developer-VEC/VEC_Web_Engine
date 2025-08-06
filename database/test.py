import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"

client = MongoClient(mongo_uri)
db = client[db_name]

import json
from pymongo import MongoClient


def insert_admissions_sections():
    collection = db["admissions"]

    with open("/root/VEC_Web_Engine/docs/admissions.json", "r", encoding="utf-8") as file:
        admissions_data = json.load(file)

        for section in admissions_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("Admission sections inserted successfully.")

def insert_curriculum_data():
    collection = db['curriculum']
    with open("/root/VEC_Web_Engine/docs/curriculum.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Curriculum documents inserted successfully.\n")


def insert_landing_page_sections():
    collection = db["landing_page_details"]

    with open("/root/VEC_Web_Engine/docs/landing_page_details.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("landing page sections inserted successfully.")


def insert_placement_sections():
    collection = db["placement"]

    with open("/root/VEC_Web_Engine/docs/placement.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("placement sections inserted successfully.")

def insert_web_team():
    collection = db['web_team']
    with open('/root/VEC_Web_Engine/docs/web_team.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("web team data inserted successfully.")



insert_web_team()
insert_placement_sections()
insert_landing_page_sections()
insert_curriculum_data()
insert_admissions_sections()