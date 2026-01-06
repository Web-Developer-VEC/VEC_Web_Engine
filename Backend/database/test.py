import os
import requests
import pandas as pd
from pymongo import MongoClient
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

#Hostel Student Test Settings is Turned On Till Now at line 1126
mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"
client = MongoClient(mongo_uri)
db = client[db_name]
logsdb = client["LOGS_VEC"]

def insert_admissions_sections():
    collection = db["student"]

    with open("/root/VEC_Web_Engine/Backend/docs/students_output.json", "r", encoding="utf-8") as file:
        admissions_data = json.load(file)

    # Direct insert (normal insert)
    collection.insert_many(admissions_data)

    print("Admission sections inserted successfully.")
