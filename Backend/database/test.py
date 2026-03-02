import json
import os
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "STAFF"

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

def insert_staff_data_sections():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(BASE_DIR, "..", "docs", "STAFF_DATA")

    for dept_id, collection_name in deptMap.items():
        file_path = os.path.join(base_path, f"{dept_id}.json")

        staff_collection_name = f"{collection_name}_staff"
        collection = db[staff_collection_name]

        try:
            if not os.path.exists(file_path):
                print(f"⚠️ Skipping missing file: {file_path}")
                continue

            with open(file_path, "r", encoding="utf-8") as file:
                staff_data = json.load(file)

            documents = []

            for section in staff_data:
                for section_name, people_list in section.items():
                    documents.append({
                        "type": section_name,
                        "data": people_list
                    })

            if documents:
                collection.insert_many(documents)
                print(f"✅ {dept_id} staff data inserted into '{staff_collection_name}'")
            else:
                print(f"⚠️ No valid sections in {file_path}")

        except json.JSONDecodeError as e:
            print(f"❌ JSON error in {file_path}: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")# def insert_staff_data_sections():
#     base_path = "/VEC_Web_Engine/Backend/docs/STAFF_DATA/"  # 👈 your staff folder path

#     for dept_id, collection_name in deptMap.items():
#         file_path = f"{base_path}{dept_id}.json"

#         # 👇 Add _staff to collection name
#         staff_collection_name = f"{collection_name}_staff"
#         collection = db[staff_collection_name]

#         try:
#             with open(file_path, "r", encoding="utf-8") as file:
#                 staff_data = json.load(file)

#             documents = [
#                 {
#                     "type": section.get("type"),
#                     "data": section.get("data")
#                 }
#                 for section in staff_data
#             ]

#             if documents:
#                 collection.insert_many(documents)
#                 print(f"{dept_id} staff data inserted into '{staff_collection_name}'.")
#             else:
#                 print(f"No data in {file_path}")

#         except FileNotFoundError:
#             print(f"File not found: {file_path}")
#         except json.JSONDecodeError as e:
#             print(f"Error decoding JSON in file {file_path}: {e}")
#         except Exception as e:
#             print(f"Unexpected error processing {file_path}: {e}")


insert_staff_data_sections()