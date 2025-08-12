import os
import requests
import pandas as pd
from pymongo import MongoClient
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

#Hostel Student Test Settings is Turned On Till Now at line 1126
mongo_uri = "mongodb://localhost:27017/"
db_name = "DBTEST"
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
    base_path = "/Github/VEC_Web_Engine/Backend/docs/DEPT_DATA/"
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
    with open ("/Github/VEC_Web_Engine/Backend/docs/sidebar.json","r",encoding="utf-8") as file:
        documents= json.load(file)
        collection.insert_many(documents)
    print("Sidebar documents inserted successfully\n")

def insert_iic_sections():
    collection = db["iic"]

    with open("/Github/VEC_Web_Engine/Backend/docs/iic.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("iic sections inserted successfully.")


def insert_admissions_sections():
    collection = db["admissions"]

    with open("/Github/VEC_Web_Engine/Backend/docs/admissions.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/exams.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/placement.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("placement sections inserted successfully.")

def insert_iqac_sections():
    collection = db["iqac"]
    with open("/Github/VEC_Web_Engine/Backend/docs/IQAC.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/accreditations_and_ranking.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("accreditations and ranking sections inserted successfully.")

def insert_ecell_sections():
    collection = db["ecell"]

    with open("/Github/VEC_Web_Engine/Backend/docs/e_cell.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("e cell sections inserted successfully.")

def insert_transport_sections():
    collection = db["transport"]

    with open("/Github/VEC_Web_Engine/Backend/docs/transport.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("transport sections inserted successfully.")

def insert_other_facilities_sections():
    collection = db["other_facilities"]

    with open("/Github/VEC_Web_Engine/Backend/docs/other_facilities.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("other facilities sections inserted successfully.")

def insert_gallery_sections():
    collection = db["gallery"]

    with open("/Github/VEC_Web_Engine/Backend/docs/gallery.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/academics.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("academics sections inserted successfully.")

def insert_web_team():
    collection = db["web_team"]

    with open("/Github/VEC_Web_Engine/Backend/docs/web_team.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("web team sections inserted successfully.")


insert_department_data_sections()
insert_web_team()
insert_academics_sections()
insert_gallery_sections()
insert_other_facilities_sections()
insert_transport_sections()
insert_ecell_sections()
insert_accreditations_and_ranking_sections()
insert_iqac_sections()
insert_placement_sections()
insert_exams_sections()
insert_sidebar_details()
insert_iic_sections()
insert_admissions_sections()

department_mapping = {
    "Artificial Intelligence and Data Science": "001",
    "Automobile Engineering": "002",
    "Chemistry": "003",
    "Civil Engineering": "004",
    "Computer Science & Engineering": "005",
    "Computer Science and Engineering (CYBER SECURITY)": "006",
    "Electrical & Electronics Engineering": "007",
    "Electronics & Instrumentation Engineering": "008",
    "Electronics and Communication Engineering": "009",
    "English": "010",
    "Information Technology": "011",
    "Mathematics": "012",
    "Mechancial Engineering": "013",
    "Tamil": "014",
    "Physics": "015",
    "Master Of Computer Science": "016",
    "Master of Business Admin": "017",
    "Physical Education":"020",
    "Placement":"021"
}

def insert_incubations_sections():
    collection = db["incubation"]

    with open("/Github/VEC_Web_Engine/Backend/docs/incubation.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("incubation sections inserted successfully.")

# SPORTS DATA INSERTIONS

def insert_library_sections():
    collection = db["library"]

    with open("/Github/VEC_Web_Engine/Backend/docs/library.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("library sections inserted successfully.")

def insert_about_us():
    collection = db["about_us"]

    with open("/Github/VEC_Web_Engine/Backend/docs/about_us.json", "r", encoding="utf-8") as file:
        about_data = json.load(file)

        for section in about_data:
            section_type = section["type"]
            document = {
                "type": section_type,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("about_us sections inserted successfully.")

def insert_help_desk():

    collection = db['help_desk']  
    with open("/Github/VEC_Web_Engine/Backend/docs/help_desk.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("help_desk documents inserted successfully.\n")


def insert_administration_sections():
    collection = db["administration"]

    with open("/Github/VEC_Web_Engine/Backend/docs/administration.json", "r", encoding="utf-8") as file:
        admin_data = json.load(file)

        for section in admin_data:
            section_type = section["type"]
            document = {
                "type": section_type,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("Administration sections inserted successfully.")

def create_logs_collection():
    db.create_collection('logs')
    print("logs collection created successfully.")

def insert_web_team():
    collection = db['web_team']
    with open('/Github/VEC_Web_Engine/Backend/docs/web_team.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("web team data inserted successfully.")


def insert_hostel_sections():
    collection = db["hostel_details"]

    with open("/Github/VEC_Web_Engine/Backend/docs/hostel.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/ncc_army.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/ncc_navy.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/nss.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/sports_data.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/transport.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/yrc.json", "r", encoding="utf-8") as file:
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

    with open("/Github/VEC_Web_Engine/Backend/docs/landing_page_details.json", "r", encoding="utf-8") as file:
        exams_data = json.load(file)

        for section in exams_data:
            section_key = section["type"]
            document = {
                "type": section_key,
                "data": section["data"]
            }
            collection.insert_one(document)

    print("landing page sections inserted successfully.")

def insert_research_data():
    collection = db['research']
    with open('/Github/VEC_Web_Engine/Backend/docs/research.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("Research data inserted successfully.")


insert_landing_page_sections()
insert_sports_sections()
insert_nss_sections()
insert_ncc_navy_sections()
insert_ncc_army_sections()
insert_hostel_sections()
insert_transport_sections()
insert_yrc_sections()
insert_administration_sections()
insert_library_sections()
insert_incubations_sections()
insert_about_us()
insert_help_desk()
#create_logs_collection()
insert_web_team()
insert_research_data()

'''def add_hostel_student_database():
    collection = db["student_database"]
    storage_dir = r"/Github/VEC_Web_Engine/Backend/docs/CSV"
    image_dir = r"/Github/VEC_Web_Engine/static/student_database"
    os.makedirs(storage_dir, exist_ok=True)  
    os.makedirs(image_dir, exist_ok=True)  

    csv_file_path = os.path.join(storage_dir, "VEC_Hostel_Students.csv")

    df = pd.read_csv(csv_file_path)
    df = df.head(1) #comment this line for getting the full student database in

    df.columns = df.columns.str.strip()

    def extract_drive_file_id(drive_link):
        if isinstance(drive_link, str) and "drive.google.com" in drive_link:
            if "id=" in drive_link:
                return drive_link.split("id=")[-1]
            elif "/d/" in drive_link:
                return drive_link.split("/d/")[1].split("/")[0]
        return None

    def set_path(drive_link, reg_number):
        file_id = extract_drive_file_id(drive_link)
        if not file_id:
            print(f"⚠️ Invalid Google Drive link for {reg_number}: {drive_link}")
            return None

        image_path = os.path.join(image_dir, f"{reg_number}.jpeg")
        download_url = f"https://drive.google.com/uc?id={file_id}"

        try:
            response = requests.get(download_url, stream=True)
            if response.status_code == 200:
                with open(image_path, "wb") as file:
                    for chunk in response.iter_content(1024):
                        file.write(chunk)
                print(f"Downloaded profile photo for {reg_number}")
                return f"/static/images/student_profile_photos/{reg_number}.jpeg"
            else:
                print(f"❌ Failed to download image for {reg_number} (HTTP {response.status_code})")
                return None
        except Exception as e:
            print(f"❌ Error downloading image for {reg_number}: {e}")
            return None

    def hash_password(password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def format_food_type(food_type):
        return "Non-Veg" if food_type == "Non-Vegetarian" else "Veg"

    def set_year(year, department):
        if department == 'MBA':
            if year == 1:
                return 5
            elif year == 2:
                return 6
        elif department == 'MECSE':
            if year == 1:
                return 7
            elif year == 2:
                return 8
        return year
        
    students = []
    for _, row in df.iterrows():
        reg_number = str(row.get("Registration Number (Example : 11322207000)", ""))

        student_doc = {
            "name": row.get("Name (Example : JOHN DOE K)", ""),
            "registration_number": reg_number,
            "password": hash_password(str(row.get("Password (Format  DD-MM-YYYY)", ""))),
            "admin_number": row.get("Admission Number (Example : 22VEC-000)", ""),
            "room_number": row.get("Room Number (Current)", ""),
            "department": row.get("Department", ""),
            "gender": row.get("Gender", ""),
            "phone_number_student": row.get("Student Phone Number (Example : 9876543210)", ""),
            "city": row.get("City", ""),
            "foodtype": format_food_type(row.get("Food Type", "")),
            "year": set_year(int(row.get("Year of Studying", 0) or 0), row.get("Department", "")),
            "profile_photo_path": set_path(row.get("Student Image", ""), reg_number),
            "block_name": row.get("Block Name", ""),
            "late_count": 0,
            "QR_path": f"/static/student_barcode/{reg_number}.png",
            "edit_status": "Approved",
            "changes": []
        }
        students.append(student_doc)

    if students:
        collection.insert_many(students)
        print(f"Successfully inserted {len(students)} students into MongoDB!")
    else:
        print("⚠️ No student data to insert.")'''

#add_hostel_student_database()