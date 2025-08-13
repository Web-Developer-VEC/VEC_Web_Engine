import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "TEST"

client = MongoClient(mongo_uri)
db = client[db_name]

deptMap = {
    "001":  "AIDS_001",
    "002":  "AUTO_002",
    "003":  "CHEMISTRY_003",
    "004":  "CIVIL_004",
    "005":  "CSE_005",
    "006":  "CSECS_006",
    "007":  "EEE_007",
    "008":  "EIE_008",
    "009":  "ECE_009",
    "010":  "ENGLISH_010",
    "011":  "IT_011",
    "012":  "MATHS_012",
    "013":  "MECH_013",
    "014":  "TAMIL_014",
    "015":  "PHYSICS_015",
    "016":  "MECSE_016",
    "017":  "MBA_017",
    "018":  "PS_018"
}

def insert_department_data_sections():
    base_path = "/VEC_Web_Engine/Backend/docs/DEPT_DATA/"
    for dept_id, collection_name in deptMap.items():
        file_path = f"{base_path}{dept_id}.json"
        collection = db[collection_name]

        try:
            with open(file_path, "r", encoding="utf-8") as file:
                department_data = json.load(file)

            documents = [
                {"type": section.get("type"), "data": section.get("data")}
                for section in department_data
            ]

            if documents:
                collection.insert_many(documents)
                print(f"{dept_id} dept_data inserted into '{collection_name}'.")
            else:
                print(f"No data in {file_path}")

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