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
                "data": section["data"]
            }
            collection.insert_one(document)

    print("Admission sections inserted successfully.")

def insert_exams_sections():
    collection = db["exams"]

    with open("/VEC_WEB_Engine/docs/exams.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("Exam sections inserted successfully.")

def insert_placement_sections():
    collection = db["placement"]

    with open("/VEC_WEB_Engine/docs/placement.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("placement sections inserted successfully.")

def insert_library_sections():
    collection = db["library"]

    with open("/VEC_WEB_Engine/docs/library.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("library sections inserted successfully.")

def insert_iqac_sections():
    collection = db["iqac"]

    with open("/VEC_WEB_Engine/docs/iqac.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("iqac sections inserted successfully.")

def insert_accreditations_and_ranking_sections():
    collection = db["accreditations_and_ranking"]

    with open("/VEC_WEB_Engine/docs/accreditations_and_ranking.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("accreditations and ranking sections inserted successfully.")

def insert_iic_sections():
    collection = db["iic"]

    with open("/VEC_WEB_Engine/docs/iic.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("iic sections inserted successfully.")

def insert_incubations_sections():
    collection = db["incubation"]

    with open("/VEC_WEB_Engine/docs/incubation.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("incubation sections inserted successfully.")

def insert_ecell_sections():
    collection = db["ecell"]

    with open("/VEC_WEB_Engine/docs/e_cell.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("e cell sections inserted successfully.")

def insert_other_facilities_sections():
    collection = db["other_facilities"]

    with open("/VEC_WEB_Engine/docs/other_facilities.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("other facilities sections inserted successfully.")

def insert_hostel_sections():
    collection = db["hostel_details"]

    with open("/VEC_WEB_Engine/docs/hostel.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("hostel facilities sections inserted successfully.")

def insert_ncc_army_sections():
    collection = db["ncc_army"]

    with open("/VEC_WEB_Engine/docs/ncc_army.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("ncc army sections inserted successfully.")

def insert_ncc_navy_sections():
    collection = db["ncc_navy"]

    with open("/VEC_WEB_Engine/docs/ncc_navy.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("ncc navy sections inserted successfully.")

def insert_nss_sections():
    collection = db["nss"]

    with open("/VEC_WEB_Engine/docs/nss.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("nss sections inserted successfully.")

def insert_sports_sections():
    collection = db["sports"]

    with open("/VEC_WEB_Engine/docs/sports_data.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("sports sections inserted successfully.")

def insert_transport_sections():
    collection = db["transport"]

    with open("/VEC_WEB_Engine/docs/transport.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("transport sections inserted successfully.")

def insert_yrc_sections():
    collection = db["yrc"]

    with open("/VEC_WEB_Engine/docs/yrc.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("yrc sections inserted successfully.")

def insert_landing_page_sections():
    collection = db["landing_page_details"]

    with open("/VEC_WEB_Engine/docs/landing_page_details.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("landing page sections inserted successfully.")

def insert_gallery_sections():
    collection = db["gallery"]

    with open("/VEC_WEB_Engine/docs/gallery.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("gallery sections inserted successfully.")

def insert_academics_sections():
    collection = db["academics"]

    with open("/VEC_WEB_Engine/docs/academics.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("academics sections inserted successfully.")

insert_academics_sections()
#insert_gallery_sections()    
#insert_landing_page_sections()
#insert_sports_sections()
#insert_nss_sections()
#insert_ncc_navy_sections()
#insert_ncc_army_sections()
#insert_hostel_sections()
#insert_transport_sections()
#insert_yrc_sections()
#insert_other_facilities_sections()
#insert_transport_sections()
#insert_ecell_sections()
#insert_incubations_sections()
#insert_iic_sections()
#insert_accreditations_and_ranking_sections()
#insert_iqac_sections()
#insert_library_sections()
#insert_placement_sections()
#insert_exams_sections()
#insert_admissions_sections()
#insert_administration_sections()
#insert_about_us()
