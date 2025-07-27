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

import json
from pymongo import MongoClient

def insert_academic_calendar():
    collection = db['academics']
    with open("/VEC_WEB_Engine/docs/academic_calender.json", "r", encoding="utf-8") as file:
        calendar_data = json.load(file)
        document = {
            "type": "academic_calendar",
            "data": calendar_data
        }
        collection.insert_one(document)
    print("Academic calendar inserted successfully.")


def insert_programmes_list():
    collection = db['academics']
    with open("/VEC_WEB_Engine/docs/programmes_list.json", "r", encoding="utf-8") as file:
        programmes_data = json.load(file)
        document = {
            "type": "programmes_list",
            "data": programmes_data
        }
        collection.insert_one(document)
    print("Programmes list inserted successfully.")


def insert_departments_list():
    collection = db['academics']
    with open("/VEC_WEB_Engine/docs/departments_list.json", "r", encoding="utf-8") as file:
        departments_data = json.load(file)
        document = {
            "type": "departments_list",
            "data": departments_data
        }
        collection.insert_one(document)
    print("Departments list inserted successfully.")

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


def insert_administration_sections():
    collection = db["administration"]

    with open("/VEC_WEB_Engine/docs/administration.json", "r", encoding="utf-8") as file:
        admin_data = json.load(file)

        for section in admin_data:
            section_key = list(section.keys())[0]
            document = {
                "type": section_key,
                "data": section[section_key]
            }
            collection.insert_one(document)

    print("Administration sections inserted successfully.")

def insert_admissions_sections():
    collection = db["admissions"]

    with open("/VEC_WEB_Engine/docs/admissions.json", "r", encoding="utf-8") as file:
        admissions_data = json.load(file)

        for section in admissions_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "year": section["year"],
                "data": section["data"]
            }
            collection.insert_one(document)

    print("Admission sections inserted successfully.")

insert_admissions_sections()
#insert_administration_sections()
#insert_about_us()
#insert_academic_calendar()
#insert_programmes_list()
#insert_departments_list()
