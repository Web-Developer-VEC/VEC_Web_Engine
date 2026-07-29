import requests

role_routes = {
    "super_admin": [],
    "research_admin": [],
    "exam_admin": [],
    "about_us_admin": [],
    "placement_admin": [],
    "admissions_admin": [],
    "administration_admin": [],
    "academics_admin": [],
    "dept_001_admin": [],
    "dept_002_admin": [],
    "dept_003_admin": [],
    "dept_004_admin": [],
    "dept_005_admin": [],
    "dept_006_admin": [],
    "dept_007_admin": [],
    "dept_008_admin": [],
    "dept_009_admin": [],
    "dept_010_admin": [],
    "dept_011_admin": [],
    "dept_012_admin": [],
    "dept_013_admin": [],
    "dept_014_admin": [],
    "dept_015_admin": [],
    "dept_016_admin": [],
    "gallery_admin": [],
    "help_desk_admin": [],
    "hostel_admin": [],
    "other_facilities_admin": [],
    "library_admin": [],
    "iic_admin": [],
    "transport_admin": [],
    "incubation_admin": [],
    "ncc_navy_admin": [],
    "ncc_army_admin": [],
    "nss_admin": [],
    "yrc_admin": [],
    "iqac_admin": [],
    "accreditation_admin": [],
    "sports_admin": []
}

API = "http://localhost:5000/api/admin-backend/signup"

for role in role_routes.keys():
    user = {
        "name": role,
        "role": role,
        "email": f"{role}@gmail.com",
        "password": "123",
        "phone_no": "1234567890"
    }

    try:
        response = requests.post(API, json=user)

        if response.ok:
            print(f"✅ Created: {role}")
        else:
            try:
                print(f"❌ {role}: {response.json()}")
            except:
                print(f"❌ {role}: {response.text}")

    except Exception as e:
        print(f"❌ {role}: {e}")

print("Done!")