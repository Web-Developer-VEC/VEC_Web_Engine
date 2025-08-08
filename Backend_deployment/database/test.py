import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "TEST"

client = MongoClient(mongo_uri)
db = client[db_name]

import json
from pymongo import MongoClient


def insert_department_data_sections():
    collection = db["007"]

    with open("/VEC_Web_Engine/Backend_Deployment/docs/DEPT_DATA/007.json", "r", encoding="utf-8") as file:
        admissions_data = json.load(file)

        for section in admissions_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("007 dept_data sections inserted successfully.")


def insert_sidebar_details():
    collection= db['sidebar']
    with open ("/VEC_Web_Engine/Backend_Deployment/docs/sidebar.json","r",encoding="utf-8") as file:
        documents= json.load(file)
        collection.insert_many(documents)
    print("Sidebar documents inserted successfully\n")

insert_department_data_sections()
insert_sidebar_details()