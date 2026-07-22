import json
import os
from pymongo import MongoClient

# -----------------------------
# MongoDB Connection
# -----------------------------
mongo_uri = "mongodb://localhost:27017/"
db_name = "STAFF"

client = MongoClient(mongo_uri)
db = client[db_name]

# -----------------------------
# Department Mapping
# -----------------------------
deptMap = {
    "001": "AIDS_001",
    "002": "AUTO_002",
    "003": "CHEMISTRY_003",
    "004": "CIVIL_004",
    "005": "CSE_005",
    "006": "CSECS_006",
    "007": "EEE_007",
    "008": "EIE_008",
    "009": "ECE_009",
    "010": "ENGLISH_010",
    "011": "IT_011",
    "012": "MATHS_012",
    "013": "MECH_013",
    "014": "TAMIL_014",
    "015": "PHYSICS_015",
    "016": "MECSE_016",
    "017": "MBA_017",
    "018": "PS_018"
}

# -----------------------------
# Project Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAFF_DATA_DIR = os.path.join(BASE_DIR, "docs", "STAFF_DATA")


# -----------------------------
# Insert Staff Data
# -----------------------------
def insert_staff_data_sections():

    for dept_id, collection_name in deptMap.items():

        file_path = os.path.join(STAFF_DATA_DIR, f"{dept_id}.json")
        staff_collection_name = f"{collection_name}_staff"
        collection = db[staff_collection_name]

        try:

            if not os.path.exists(file_path):
                print(f"⚠️ File not found: {file_path}")
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

            if not documents:
                print(f"⚠️ No valid data in {file_path}")
                continue

            # Remove old data
            collection.delete_many({})

            # Insert new data
            collection.insert_many(documents)

            print(f"✅ {dept_id} -> {staff_collection_name} ({len(documents)} documents inserted)")

        except json.JSONDecodeError as e:
            print(f"❌ JSON Error in {file_path}")
            print(e)

        except Exception as e:
            print(f"❌ Error processing {file_path}")
            print(e)


# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    insert_staff_data_sections()
    print("\n🎉 Staff data insertion completed.")