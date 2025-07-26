import os
import requests
import pandas as pd
from pymongo import MongoClient
from docx import Document
import json
import shutil
import bcrypt
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

#Hostel Student Test Settings is Turned On Till Now at line 1126
mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"
collection_name = "staff_details"

file_path = r"/VEC-Backend/docs/CSV/VEC_Faculty_Details.csv"
base_save_dir = r"/VEC-Backend/static/staff_scholar_details/"

client = MongoClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]

columns_to_keep = [
    "Name",
    "Initial or Surname",
    "Designation",
    "Joined in",
    "Department Name",
    "Mail ID",
    "Photo",
    "Google Scholar Profile",
    "Research Gate",
    "Orchid Profile",
    "Publon Profile",
    "Scopus Author Profile",
    "LinkedIn Profile",
    "Professional Membership",
    "Sponsored Projects",
    "Patent Granted",
    "Patent Published",
    "Patent Filed",
    "Journal Publications",
    "Conference Publications",
    "Book / Book Chapter Published",
    "Seminar / Workshop / Guest Lectures Delivered",
    "Seminar / Workshop / Guest Lectures Attended",
    "Conference / Seminar / Workshop / Guest Lectures Organized",
    "PHD Produced",
    "PHD Pursuing",
    "Upload Your Excel File Here"
]

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

department_mapping1 = {
    "Artificial Intelligence and Data Science (AI&DS)": "001",
    "Automobile Engineering (AUTO)": "002",
    "Chemistry": "003",
    "Civil Engineering (CIVIL)": "004",
    "Computer Science & Engineering (CSE)": "005",
    "Computer Science and Engineering (CYBER SECURITY)": "006",
    "Electrical & Electronics Engineering (EEE)": "007",
    "Electronics & Instrumentation Engineering (EIE)": "008",
    "Electronics and Communication Engineering (ECE)": "009",
    "English": "010",
    "Information Technology (IT)": "011",
    "Mathematics": "012",
    "Mechancial Engineering (MECH)": "013",
    "Tamil": "014",
    "Physics": "015",
    "Master Of Computer Science": "016",
    "Master of Business Admin": "017",
    "Physical Education":"020",
    "Placement":"021"
}

designation_mapping = {
    "Professor & Head": "01",
    "Professor": "02",
    "Associate Professor": "03",
    "Assistant Professor": "04"
}

try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"File not found at {file_path}. Please check the path.")
    exit()

df = df[columns_to_keep]

def generate_unique_id(index, department, designation):
    department_id = department_mapping.get(department, "000")
    designation_id = designation_mapping.get(designation, "00") 
    unique_id = str(index + 1).zfill(3)
    return f"VEC-{department_id}-{designation_id}-{unique_id}"


#df = df.head(1) #Remove this line to deactivate Test settings

df['unique_id'] = [
    generate_unique_id(i, df.at[i, 'Department Name'], df.at[i, 'Designation'])
    for i in range(len(df))
]

def get_image_path(unique_id):
    return f"/static/images/staff_profile_images/{unique_id}.webp"

df['Photo'] = df['unique_id'].apply(get_image_path)

def extract_file_id(url):
    if url and isinstance(url, str) and "id=" in url:
        return url.split("id=")[-1]
    return None

def save_sheets_to_csv(file_path, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    excel_data = pd.ExcelFile(file_path)
    for sheet_name in excel_data.sheet_names:
        sheet_data = excel_data.parse(sheet_name) 
        csv_file = os.path.join(output_folder, f"{sheet_name}.csv") 
        sheet_data.to_csv(csv_file, index=False)

def download_and_save_faculty_data(unique_id, file_url):
    save_dir = os.path.join(base_save_dir, unique_id)
    os.makedirs(save_dir, exist_ok=True)

    file_id = extract_file_id(file_url)
    if not file_id:
        print(f"Invalid URL or missing file ID for {unique_id}. Skipping.")
        return

    download_url = f"https://drive.google.com/uc?id={file_id}"

    try:
        response = requests.get(download_url)
        if response.status_code == 200:
            excel_file_path = os.path.join(save_dir, f"{unique_id}_data.xlsx")
            with open(excel_file_path, 'wb') as f:
                f.write(response.content)
            save_sheets_to_csv(excel_file_path, save_dir)
        else:
            print(f"Failed to download file for {unique_id}. URL: {file_url}")
    except Exception as e:
        print(f"Error downloading or saving file for {unique_id}: {e}")

def insert_educational_qualifications_per_faculty(unique_id):
    folder_path = os.path.join(base_save_dir, unique_id)
    educational_file_path = os.path.join(folder_path, "EDUCATIONAL QUALIFICATION.csv")

    if not os.path.exists(educational_file_path):
        print(f"Educational qualification file not found for {unique_id}. Skipping.")
        return

    try:
        data = pd.read_csv(educational_file_path)
        educational_data = {
            "EDUCATIONAL_QUALIFICATION": data.to_dict(orient="records")
        }
        result = collection.update_one(
            {"unique_id": unique_id},
            {"$set": educational_data}
        )

        print(f"Update result: {result.modified_count} document(s) updated.\n")
        if result.modified_count > 0:
            print(f"Educational qualifications added for {unique_id}.\n")
        else:
            print(f"No changes made for {unique_id}.\n")
    except Exception as e:
        print(f"Error inserting educational qualifications for {unique_id}: {e}")

def insert_experience(unique_id):
    folder_path = os.path.join(base_save_dir, unique_id)
    experience_file_path = os.path.join(folder_path, "EXPERIENCE.csv")

    if not os.path.exists(experience_file_path):
        print(f"Experience file not found for {unique_id}. Skipping.")
        return

    try:
        data = pd.read_csv(experience_file_path)
        cleaned_columns = []
        for col in data.columns:
            cleaned_col = col.strip().replace(' ', '_')
            cleaned_columns.append(cleaned_col)
        data.columns = cleaned_columns

        experience_data = {
            "EXPERIENCE": data.to_dict(orient="records")
        }
        existing_document = collection.find_one({"unique_id": unique_id})
        
        if existing_document:
            result = collection.update_one(
                {"unique_id": unique_id},
                {"$set": experience_data}
            )
            print(f"Update result: {result.modified_count} document(s) updated.\n")
            if result.modified_count > 0:
                print(f"Experience data updated for {unique_id}.\n")
            else:
                print(f"No changes made for {unique_id}.\n")
        else:
            experience_data["unique_id"] = unique_id
            collection.insert_one(experience_data)
            print(f"Experience data added for {unique_id}.\n")
        
    except Exception as e:
        print(f"Error inserting experience data for {unique_id}: {e}\n")

def insert_projects(unique_id):
    folder_path = os.path.join(base_save_dir, unique_id)
    projects_file_path = os.path.join(folder_path, "PROJECTS.csv")

    if not os.path.exists(projects_file_path):
        print(f"Projects file not found for {unique_id}. Skipping.\n")
        return

    try:
        data = pd.read_csv(projects_file_path)
        cleaned_columns = []
        for col in data.columns:
            cleaned_col = col.strip().replace(' ', '_')
            cleaned_columns.append(cleaned_col)
        data.columns = cleaned_columns

        projects_data = {
            "PROJECTS": data.to_dict(orient="records")
        }
        existing_document = collection.find_one({"unique_id": unique_id})

        if existing_document:
            result = collection.update_one(
                {"unique_id": unique_id},
                {"$set": projects_data}
            )
            print(f"Update result: {result.modified_count} document(s) updated.\n")
            if result.modified_count > 0:
                print(f"Projects data updated for {unique_id}.\n")
            else:
                print(f"No changes made for {unique_id}.\n")
        else:
            projects_data["unique_id"] = unique_id
            collection.insert_one(projects_data)
            print(f"Projects data added for {unique_id}.\n")
        
    except Exception as e:
        print(f"Error inserting projects data for {unique_id}: {e}\n")

def insert_patents(unique_id):
    folder_path = os.path.join(base_save_dir, unique_id)
    patents_file_path = os.path.join(folder_path, "PATENTS.csv")

    if not os.path.exists(patents_file_path):
        print(f"Patents file not found for {unique_id}. Skipping.\n")
        return

    try:
        data = pd.read_csv(patents_file_path)
        cleaned_columns = []
        for col in data.columns:
            cleaned_col = col.strip().replace(' ', '_')
            cleaned_columns.append(cleaned_col)
        data.columns = cleaned_columns

        patents_data = {
            "PATENTS": data.to_dict(orient="records")
        }
        existing_document = collection.find_one({"unique_id": unique_id})

        if existing_document:
            result = collection.update_one(
                {"unique_id": unique_id},
                {"$set": patents_data}
            )
            print(f"Update result: {result.modified_count} document(s) updated.\n")
            if result.modified_count > 0:
                print(f"Patents data updated for {unique_id}.\n")
            else:
                print(f"No changes made for {unique_id}.\n")
        else:
            patents_data["unique_id"] = unique_id
            collection.insert_one(patents_data)
            print(f"Patents data added for {unique_id}.\n")
        
    except Exception as e:
        print(f"Error inserting patents data for {unique_id}: {e}\n")

def insert_journal_publications(unique_id):
    folder_path = os.path.join(base_save_dir, unique_id)
    journal_publications_file_path = os.path.join(folder_path, "JOURNAL-PUBLICATIONS.csv")

    if not os.path.exists(journal_publications_file_path):
        print(f"Journal publications file not found for {unique_id}. Skipping.\n")
        return

    try:
        data = pd.read_csv(journal_publications_file_path)
        cleaned_columns = []
        for col in data.columns:
            cleaned_col = col.strip().replace(' ', '_')
            cleaned_columns.append(cleaned_col)
        data.columns = cleaned_columns

        journal_publications_data = {
            "JOURNAL_PUBLICATIONS": data.to_dict(orient="records")
        }
        existing_document = collection.find_one({"unique_id": unique_id})

        if existing_document:
            result = collection.update_one(
                {"unique_id": unique_id},
                {"$set": journal_publications_data}
            )
            print(f"Update result: {result.modified_count} document(s) updated.\n")
            if result.modified_count > 0:
                print(f"Journal publications data updated for {unique_id}.\n")
            else:
                print(f"No changes made for {unique_id}.\n")
        else:
            journal_publications_data["unique_id"] = unique_id
            collection.insert_one(journal_publications_data)
            print(f"Journal publications data added for {unique_id}.\n")
        
    except Exception as e:
        print(f"Error inserting journal publications data for {unique_id}: {e}\n")

def insert_conference_publications(unique_id):
    folder_path = os.path.join(base_save_dir, unique_id)
    conference_publications_file_path = os.path.join(folder_path, "CONFERENCE-PUBLICATIONS.csv")

    if not os.path.exists(conference_publications_file_path):
        print(f"Conference publications file not found for {unique_id}. Skipping.\n")
        return

    try:
        data = pd.read_csv(conference_publications_file_path)
        cleaned_columns = []
        for col in data.columns:
            cleaned_col = col.strip().replace(' ', '_')
            cleaned_columns.append(cleaned_col)
        data.columns = cleaned_columns

        conference_publications_data = {
            "CONFERENCE_PUBLICATIONS": data.to_dict(orient="records")
        }
        existing_document = collection.find_one({"unique_id": unique_id})

        if existing_document:
            result = collection.update_one(
                {"unique_id": unique_id},
                {"$set": conference_publications_data}
            )
            print(f"Update result: {result.modified_count} document(s) updated.\n")
            if result.modified_count > 0:
                print(f"Conference publications data updated for {unique_id}.\n")
            else:
                print(f"No changes made for {unique_id}.\n")
        else:
            conference_publications_data["unique_id"] = unique_id
            collection.insert_one(conference_publications_data)
            print(f"Conference publications data added for {unique_id}.\n")
        
    except Exception as e:
        print(f"Error inserting conference publications data for {unique_id}: {e}\n")

def insert_book_publications(unique_id):
    folder_path = os.path.join(base_save_dir, unique_id)
    book_publications_file_path = os.path.join(folder_path, "BOOK-PUBLICATIONS.csv")

    if not os.path.exists(book_publications_file_path):
        print(f"Book publications file not found for {unique_id}. Skipping.\n")
        return

    try:
        data = pd.read_csv(book_publications_file_path)
        cleaned_columns = []
        for col in data.columns:
            cleaned_col = col.strip().replace(' ', '_')
            cleaned_columns.append(cleaned_col)
        data.columns = cleaned_columns

        book_publications_data = {
            "BOOK_PUBLICATIONS": data.to_dict(orient="records")
        }
        existing_document = collection.find_one({"unique_id": unique_id})

        if existing_document:
            result = collection.update_one(
                {"unique_id": unique_id},
                {"$set": book_publications_data}
            )
            print(f"Update result: {result.modified_count} document(s) updated.\n")
            if result.modified_count > 0:
                print(f"Book publications data updated for {unique_id}.\n")
            else:
                print(f"No changes made for {unique_id}.\n")
        else:
            book_publications_data["unique_id"] = unique_id
            collection.insert_one(book_publications_data)
            print(f"Book publications data added for {unique_id}.\n")
        
    except Exception as e:
        print(f"Error inserting book publications data for {unique_id}: {e}\n")

def insert_research_scholars(unique_id):
    folder_path = os.path.join(base_save_dir, unique_id)
    research_scholars_file_path = os.path.join(folder_path, "RESEARCH SCHOLARS.csv")

    if not os.path.exists(research_scholars_file_path):
        print(f"Research scholars file not found for {unique_id}. Skipping.\n")
        return

    try:
        data = pd.read_csv(research_scholars_file_path)
        cleaned_columns = []
        for col in data.columns:
            cleaned_col = col.strip().replace(' ', '_')
            cleaned_columns.append(cleaned_col)
        data.columns = cleaned_columns

        research_scholars_data = {
            "RESEARCH_SCHOLARS": data.to_dict(orient="records")
        }
        existing_document = collection.find_one({"unique_id": unique_id})

        if existing_document:
            result = collection.update_one(
                {"unique_id": unique_id},
                {"$set": research_scholars_data}
            )
            print(f"Update result: {result.modified_count} document(s) updated.\n")
            if result.modified_count > 0:
                print(f"Research scholars data updated for {unique_id}.\n")
            else:
                print(f"No changes made for {unique_id}.\n")
        else:
            research_scholars_data["unique_id"] = unique_id
            collection.insert_one(research_scholars_data)
            print(f"Research scholars data added for {unique_id}.\n")
        
    except Exception as e:
        print(f"Error inserting research scholars data for {unique_id}: {e}\n")

data = df.to_dict(orient="records")
try:
    collection.insert_many(data)
    print(f"Successfully inserted {len(data)} documents into the '{collection_name}' collection.\n")
except Exception as e:
    print(f"Error inserting initial data: {e}\n")

'''for _, row in df.iterrows():
    faculty_unique_id = row['unique_id']
    file_url = row.get('Upload Your Excel File Here', None)
    
    if not file_url:
        print(f"No file URL provided for {faculty_unique_id}. Skipping download.\n")
        continue
    
    print(f"Processing educational qualifications for {faculty_unique_id} with file URL: {file_url}\n")
    
    download_and_save_faculty_data(faculty_unique_id, file_url)
    
    insert_educational_qualifications_per_faculty(faculty_unique_id)
    insert_experience(faculty_unique_id)
    insert_conference_publications(faculty_unique_id)
    insert_book_publications(faculty_unique_id)
    insert_patents(faculty_unique_id)
    insert_projects(faculty_unique_id)
    insert_journal_publications(faculty_unique_id)
    insert_research_scholars(faculty_unique_id)

    print(f"Completed processing data for {faculty_unique_id}.\n")'''

def process_faculty_data(row):
    faculty_unique_id = row['unique_id']
    file_url = row.get('Upload Your Excel File Here', None)

    if not file_url:
        print(f"No file URL provided for {faculty_unique_id}. Skipping download.")
        return

    print(f"Processing educational qualifications for {faculty_unique_id} with file URL: {file_url}")

    try:
        download_and_save_faculty_data(faculty_unique_id, file_url)
        
        insert_educational_qualifications_per_faculty(faculty_unique_id)
        insert_experience(faculty_unique_id)
        insert_conference_publications(faculty_unique_id)
        insert_book_publications(faculty_unique_id)
        insert_patents(faculty_unique_id)
        insert_projects(faculty_unique_id)
        insert_journal_publications(faculty_unique_id)
        insert_research_scholars(faculty_unique_id)

        print(f"Completed processing data for {faculty_unique_id}.")
    except Exception as e:
        print(f"Error processing {faculty_unique_id}: {e}")

#Threading with 8 Workers
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(process_faculty_data, row) for _, row in df.iterrows()]
    for future in as_completed(futures):
        future.result()  # This will raise any exception that occurred in the thread

def insert_department_data():
    collection = db["vision_and_mission"]
    with open("/VEC-Backend/docs/department_data.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Department documents inserted successfully.\n")

def insert_hod_datas():
    collection = db['HODS']
    with open("/VEC-Backend/docs/hods.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("HOD documents inserted successfully.\n")

def insert_infrastructure_data():
    collection = db["infrastructure"]
    with open("/VEC-Backend/docs/infrastructure.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Infrastructure documents inserted successfully.\n")

def insert_student_activities_data():
    collection = db['student_activities'] 
    with open("/VEC-Backend/docs/student_activities.json", "r", encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Student documents inserted successfully.\n")

def insert_support_staff_data():
    collection = db['support_staffs'] 
    with open("/VEC-Backend/docs/support_staffs.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Support staffs documents inserted successfully.\n")

def insert_MOUs_data():
    collection = db['MOUs']
    folder_path = "/VEC-Backend/docs/MOUs/"
    for filename in os.listdir(folder_path):
        if filename.endswith(".json"):
            file_path = os.path.join(folder_path,filename)

            with open(file_path,"r") as file:
                documents = json.load(file)
                collection.insert_many(documents)
    
    print("All MOU documents have been inserted successfully.\n")

def insert_curriculum_data():
    collection = db['curriculum']
    with open("/VEC-Backend/docs/curriculum.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Cirrculum documents inserted successfully.\n")

def insert_events_data():
    collection = db['events']  
    with open("/VEC-Backend/docs/events.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Events documents inserted successfully.\n")

def insert_special_announcements():
    collection = db['special_announcement']  
    with open("/VEC-Backend/docs/special_announcements.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("special_announcements documents inserted successfully.\n")

def insert_announcements_data():
   
    collection = db['announcements']  
    with open("/VEC-Backend/docs/announcements.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Announcements documents inserted successfully.\n")

def principal_data():
    collection = db["principal_data"]
    with open("/VEC-Backend/docs/principal_data.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Principals documents inserted successfully.\n")

def insert_admin_office_data():
    collection = db['admin_office']  
    with open("/VEC-Backend/docs/admin_office.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("admin office documents inserted successfully.\n")

def insert_committee_data():

    collection = db['committee']  
    with open("/VEC-Backend/docs/committee.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Committee documents inserted successfully.\n")

def insert_regulation_data():
    collection = db['regulation']  
    with open("/VEC-Backend/docs/regulation.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("regulation documents inserted successfully.\n")

def placement_team():
    collection = db["placement_team"]
    with open('/VEC-Backend/docs/placement_members.json', 'r',encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print(f"Placement Team Details Inserted\n")

def insert_intake_data():    
    collection = db["Intakes"]        
    with open('/VEC-Backend/docs/intakes.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("Intake data inserted successfully.\n")

def insert_dean_and_associates_data():    
    collection = db["dean_and_associates"]        
    with open('/VEC-Backend/docs/dean_and_associates.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("dean_and_associates data inserted successfully.\n")

def insert_placement_data():

    collection = db['placements_data']  
    with open("/VEC-Backend/docs/placements_data.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("placement documents inserted successfully.\n")

def insert_curriculum_and_syllabus_data():

    collection = db['curriculum_and_syllabus']  
    with open("/VEC-Backend/docs/curriculum_and_syllabus.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_one(documents)

    print("curriculum_And_syllabus documents inserted successfully.\n")

def insert_banners():
    collection = db['banner']  
    with open("/VEC-Backend/docs/banner.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Banner documents inserted successfully.\n")

def insert_all_forms_data():

    collection = db['all_forms']  
    with open("/VEC-Backend/docs/all_forms.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("all_forms documents inserted successfully.\n")

def insert_NBA_data():
    collection = db['nba']
    with open("/VEC-Backend/docs/nba.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("NBA documents inserted successfully.\n")

def insert_naac_data():
    collection = db['naac']
    with open("/VEC-Backend/docs/naac.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    print("NAAC documents inserted successfully.\n")

def insert_nirf_data():
    collection = db['nirf']
    with open("/VEC-Backend/docs/nirf.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    print("NIRF documents inserted successfully.\n")

def insert_sidebar_details():
    collection= db['sidebar']
    with open ("/VEC-Backend/docs/sidebar.json","r",encoding="utf-8") as file:
        documents= json.load(file)
        collection.insert_many(documents)
    print("Sidebar documents inserted successfully\n")

def insert_iic_details():
    collection= db['iic']
    with open ("/VEC-Backend/docs/iic.json","r",encoding="utf-8") as file:
        documents= json.load(file)
        collection.insert_many(documents)
    print("iic documents inserted successfully\n")

def insert_dept_activities_details():
    collection = db['department_activities']
    directory = "/VEC-Backend/docs/DEPT_ACT/"
    for filename in os.listdir(directory):
        if filename.endswith(".json"):  
            file_path = os.path.join(directory, filename)
            
            with open(file_path, "r", encoding="utf-8") as file:
                try:
                    document = json.load(file)
                    collection.insert_many(document)
                    print(f"Inserted {filename} successfully.")
                except Exception as e:
                    print(f"Error inserting {filename}: {e}")

    print("All department activities documents inserted successfully.\n")

def insert_newsletter():
    collection= db['news_letter']
    with open ("/VEC-Backend/docs/news_letter.json","r",encoding="utf-8") as file:
        documents= json.load(file)
        collection.insert_many(documents)
    print("newsletter inserted successfully \n")


def insert_COE_data():
    collection = db['coe']
    with open("/VEC-Backend/docs/coe.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("COE documents inserted successfully.\n")



insert_department_data()
insert_hod_datas()
insert_infrastructure_data()
insert_student_activities_data()
insert_support_staff_data()
insert_MOUs_data()
insert_curriculum_data()
insert_events_data()
insert_announcements_data()
insert_special_announcements()
principal_data()
insert_admin_office_data()
placement_team()
insert_regulation_data()
insert_intake_data()
insert_committee_data()
insert_placement_data()
insert_dean_and_associates_data()
insert_curriculum_and_syllabus_data()
insert_all_forms_data()
insert_banners()
insert_NBA_data()
insert_naac_data()
insert_nirf_data()
insert_sidebar_details()
insert_iic_details()
insert_dept_activities_details()
insert_newsletter()
insert_COE_data()

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

def insert_incubation_data():
    collection= db['incubation']
    with open ("/VEC-Backend/docs/incubation.json","r",encoding="utf-8") as file:
        documents= json.load(file)
        collection.insert_many(documents)
    print("Incubation documents inserted successfully. \n")
    
def insert_army_data():
    collection = db['army']
    with open("/VEC-Backend/docs/ncc_army.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    print("armydocuments inserted successfully. \n")

def insert_navy_data():
    collection = db['navy']
    with open("/VEC-Backend/docs/ncc_navy.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    print("NCC(NAVY) documents inserted successfully. \n")

def insert_faculty_data(folder_path):
    department_name=None
    with open(r"/VEC-Backend/docs/prev_faculty.json","r",encoding="utf-8") as file:
        data=json.load(file)
    try:
        collection = db['faculty_data']
        if not os.path.exists(folder_path):
            print(f"Error: Folder path '{folder_path}' does not exist. \n")
            return

        for file_name in os.listdir(folder_path):
            
            if file_name.endswith(".xlsx"):
                file_path = os.path.join(folder_path, file_name)

                dept_id = os.path.splitext(file_name)[0]

                try:
                    df = pd.read_excel(file_path)
                except Exception as e:
                    print(f"Error reading Excel file '{file_name}': {e}\n")
                    continue
                required_columns = [
                    "Name", "Designation", "Photo", "Google Scholar Profile",
                    "Research Gate", "Orchid Profile", "Publon Profile",
                    "Scopus Author Profile", "LinkedIn Profile", "unique_id"
                ]
                missing_columns = [col for col in required_columns if col not in df.columns]
                if missing_columns:
                    print(f"Error: Missing columns in '{file_name}': {missing_columns}\n")
                    continue 

                faculty_list = []
                for index, row in df.iterrows():
                    try:
                        faculty_data = {
                            "name": row["Name"],
                            "designation": row["Designation"],
                            "photo": row["Photo"],
                            "profiles": {
                                "google_scholar": row["Google Scholar Profile"],
                                "research_gate": row["Research Gate"],
                                "orchid": row["Orchid Profile"],
                                "publon": row["Publon Profile"],
                                "scopus": row["Scopus Author Profile"],
                                "linkedin": row["LinkedIn Profile"]
                            },
                            "unique_id": row["unique_id"]
                        }
                        faculty_list.append(faculty_data)
                    except Exception as e:
                        print(f"Error processing row {index} in '{file_name}': {e}\n")
                for name, id in department_mapping1.items() :
                    if id==dept_id:
                        department_name=name
                        
                        department_document = {
                            "department_name": department_name,
                            "dept_id": dept_id,
                            "previous_faculty_pdf_path":data.get(dept_id),
                            "faculty_members": faculty_list
                        }
                if faculty_list:
                    try:
                        collection.insert_one(department_document)
                    except Exception as e:
                        print(f"Error inserting document for '{dept_id}' into MongoDB: {e}\n")
                else:
                    print(f"No valid faculty data to insert for '{file_name}'.\n")
    except Exception as e:
        print(f"Unexpected error: {e}\n")

    print("Faculty Data Insertion Done\n")
    return

insert_faculty_data(folder_path=r"/VEC-Backend/docs/STAFF-DATA/")

# SPORTS DATA INSERTIONS

def insert_sports_data():
    collection = db["sports_data"]
    with open("/VEC-Backend/docs/sports_data.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Sports data inserted successfully.\n")


def insert_library_data():
    collection = db["library"]
    with open("/VEC-Backend/docs/library.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Library data inserted successfully.\n")

def insert_nss_data():
    collection = db["nss_data"]
    with open("/VEC-Backend/docs/nss.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("NSS data inserted successfully.\n")

def insert_yrc_data():
    collection = db["yrc_data"]
    with open("/VEC-Backend/docs/yrc.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("YRC data inserted successfully.\n")


def insert_overall_department_research():
    collection = db['overall_research']
    with open("/VEC-Backend/docs/overall_research_data.json","r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_one(documents)
    
    print("Inserted overall research data.\n")


def insert_overall_book_publication():
    collection = db['overall_book_publication']
    with open("/VEC-Backend/docs/overall_book_publication.json","r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Inserted overall book publication.\n")

def insert_overall_conference_publication():
    collection = db['overall_conference_publication']
    with open("/VEC-Backend/docs/overall_conference_publication.json","r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Inserted overall conference publication.\n")

def insert_overall_patent():
    collection = db['overall_patent']
    with open("/VEC-Backend/docs/overall_patent.json","r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Inserted overall patent.\n")


def insert_overall_journal_publications():
    collection = db['overall_journal_publications']
    with open("/VEC-Backend/docs/overall_journal_publications.json","r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Inserted overall journal publications.\n")





def insert_department_research_data():
    collection = db['research_data']
    
    folder_path = "/VEC-Backend/docs/RESEARCH-DATA"
    
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".json"):
            file_path = os.path.join(folder_path, file_name)
            
            try:
                with open(file_path, "r",encoding='utf-8') as file:
                    document = json.load(file)
                    collection.insert_one(document)
            except Exception as e:
                print(f"Error inserting {file_name}: {e}")
    
    print("All available Department Research documents inserted successfully.\n")

def insert_warden_hostel_data():
    collection = db['warden_profile']
    with open("/VEC-Backend/docs/warden_profile.json","r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Inserted warden profile data. \n")

def insert_iqac_data():
    collection = db['IQAC']
    with open("/VEC-Backend/docs/IQAC.json","r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Inserted IQAC data successfully.\n")


def insert_alumni_data():
    collection = db['alumni']
    with open("/VEC-Backend/docs/alumni.json","r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)
    
    print("Inserted Alumni data. \n")

def insert_about_placement():

    collection = db['about_placement']  
    with open("/VEC-Backend/docs/about_placement.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("about placement inserted successfully.")

def insert_about_us():

    collection = db['about_us']  
    with open("/VEC-Backend/docs/about_us.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("about_us documents inserted successfully.\n")


def insert_organization_chart():

    collection = db['organization_chart']  
    with open("/VEC-Backend/docs/organization_chart.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_one(documents)

    print("organization chart json documents inserted successfully.\n")


def insert_academic_calender():

    collection = db['academic_calender']  
    with open("/VEC-Backend/docs/academic_calender.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("academic calender inserted successfully.")



def insert_hostel_menu():

    collection = db['hostel_menu']  
    with open("/VEC-Backend/docs/hostel_menu.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("hostel_menu documents inserted successfully.\n")


def insert_help_desk():

    collection = db['help_desk']  
    with open("/VEC-Backend/docs/help_desk.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("help_desk documents inserted successfully.\n")


def insert_landing_page_details():

    collection = db['landing_page_details']  
    with open("/VEC-Backend/docs/landing_page_details.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("insert_landing_page_details documents inserted successfully.\n")

def insert_programmes_list():

    collection = db['programmes_list']  
    with open("/VEC-Backend/docs/programmes_list.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("Programmes list inserted successfully.")

def insert_departments_list():

    collection = db['departments_list']  
    with open("/VEC-Backend/docs/departments_list.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("departments list inserted successfully.")

def insert_admission_team():    
    collection = db["admission_team"]        
    with open('/VEC-Backend/docs/admission_team.json', "r",encoding="utf-8") as file:
     documents = json.load(file)
     collection.insert_many(documents)

    print("admission team data data inserted successfully.")

    
def insert_ecell_data():
    collection = db["e_cell"]
    with open("/VEC-Backend/docs/e_cell.json", "r",encoding="utf-8") as file:
        documents = json.load(file)
        collection.insert_many(documents)

    print("e_cell data inserted successfully.")


def insert_handbook_data():    
    collection = db["handbook"]        
    with open('/VEC-Backend/docs/handbook.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("Handbook data inserted successfully.")


def insert_gallery():
    collection = db["gallery"]   
    with open('/VEC-Backend/docs/gallery.json', "r",encoding="utf-8") as file:
        documents = json.load(file)
    collection.insert_many(documents)

    print("gallery data inserted successfully.")

    





insert_sports_data()
insert_library_data()
insert_nss_data()
insert_yrc_data()
insert_overall_department_research()
insert_department_research_data()
insert_warden_hostel_data()
insert_incubation_data()
insert_army_data()
insert_navy_data()
insert_alumni_data()
insert_iqac_data()
insert_overall_book_publication()
insert_overall_conference_publication()
insert_overall_patent()
insert_overall_journal_publications()
insert_academic_calender()
insert_about_placement()
insert_about_us()
insert_organization_chart()
insert_hostel_menu()
insert_help_desk()
insert_landing_page_details()
insert_programmes_list()
insert_departments_list()
insert_admission_team()
insert_ecell_data()
insert_handbook_data()
insert_gallery()
# insert_acadamic_research()

def add_hostel_student_database():
    collection = db["student_database"]
    storage_dir = r"/VEC-Backend/docs/CSV"
    image_dir = r"/VEC-Backend/static/student_database"
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
        print("⚠️ No student data to insert.")

add_hostel_student_database()