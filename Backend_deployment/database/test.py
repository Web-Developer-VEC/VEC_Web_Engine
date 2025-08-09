import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "TEST"

client = MongoClient(mongo_uri)
db = client[db_name]



deptMap = {
    "AIDS_001",
    "AUTO_002",
    "CHEMISTRY_003",
    "CIVIL_004",
    "CSE_005",
    "CSECS_006",
    "EEE_007",
    "EIE_008",
    "ECE_009",
    "ENGLISH_010",
    "IT_011",
    "MATHS_012",
    "MECH_013",
    "TAMIL_014",
    "PHYSICS_015",
    "MECSE_016",
    "MBA_017"
}

def insert_department_data_sections():
    base_path = "/VEC_Web_Engine/Backend_Deployment/docs/DEPT_DATA/"

    for dept_id, collection_name in deptMap.items():
        file_path = f"{base_path}{dept_id}.json"
        collection = db[collection_name]

        try:
            with open(file_path, "r", encoding="utf-8") as file:
                department_data = json.load(file)

            for section in department_data:
                document = {
                    "type": section.get("type"),
                    "data": section.get("data")
                }
                collection.insert_one(document)

            print(f"{dept_id} dept_data sections inserted successfully into collection '{collection_name}'.")
        except FileNotFoundError:
            print(f"File not found: {file_path}")
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON in file {file_path}: {e}")
        except Exception as e:
            print(f"Unexpected error processing {file_path}: {e}")


def insert_sidebar_details():
    collection= db['sidebar']
    with open ("/VEC_Web_Engine/Backend_Deployment/docs/sidebar.json","r",encoding="utf-8") as file:
        documents= json.load(file)
        collection.insert_many(documents)
    print("Sidebar documents inserted successfully\n")

insert_department_data_sections()
insert_sidebar_details()