const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(express.json());

app.use(session({
    secret: '12345678',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const client = new MongoClient(mongoUri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
    }
}
connectToDatabase();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
    res.send("Welcome to the Node.js MongoDB API!");
});

//Vision and Mission
app.get('/api/department/:id', async (req, res) => {
    const departmentId = req.params.id.toString(); 
    const db = client.db(dbName);
    const collection = db.collection('vision_and_mission');

    try {
        const result = await collection.findOne({ department_id: departmentId });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: "Department not found" });
        }
    } catch (error) {
        console.error("❌ Error fetching department data:", error);
        res.status(500).json({ error: "Error fetching data" });
    }
});

//Newsletter endpoint
app.get('/api/newsletter/:id', async (req, res) => {
    const departmentId = req.params.id.toString();
    const db = client.db(dbName);
    const collection = db.collection('vision_and_mission');

    try {
        const result = await collection.findOne({ department_id: departmentId }, { projection: { newsletter_path: 1, _id: 0 } });
        if (result && result.newsletter_path) {
            res.json({ newsletter_path: result.newsletter_path });
        } else {
            res.status(404).json({ error: "Newsletter path not found" });
        }
    } catch (error) {
        console.error("❌ Error fetching department data:", error);
        res.status(500).json({ error: "Error fetching data" });
    }
});

// Head Of Department Details
app.get('/api/hod/:department_id', async (req, res) => {
    const departmentId = req.params.department_id;
    const db = client.db(dbName);
    const hodsCollection = db.collection('HODS');

    try {
        const hod = await hodsCollection.findOne({
            Unique_id: { $regex: `VEC-${departmentId}-` }
        });

        if (hod) {
            res.json({
                Name: hod.Name,
                Unique_id: hod.Unique_id,
                Qualification: hod.Qualification,
                Hod_message: hod.Hod_message,
                designation:hod.designation,
                Image: hod.Image,
                Social_media_links: hod.Social_media_links
            });
        } else {
            res.status(404).json({ error: "HOD not found for this department." });
        }
    } catch (error) {
        console.error("❌ Error fetching HOD details:", error);
        res.status(500).json({ error: "Error fetching HOD details" });
    }
});

//faculty_details
app.get('/api/faculty_details/:dept_id', async (req, res) => {
    const deptId = req.params.dept_id;
    const db = client.db(dbName);
    const collection = db.collection('faculty_data');

    try {
        const staffDetails = await collection.findOne({ dept_id: deptId });

        if (staffDetails) {
            res.status(200).json(staffDetails);
        } else {
            res.status(404).json({ message: 'No staff details found for the given department ID.' });
        }
    } catch (error) {
        console.error("❌ Error fetching staff details:", error);
        res.status(500).json({ error: "Error fetching staff details" });
    }
});

//Infrastructure
app.get('/api/infrastructure/:deptId', async (req, res) => {
    const deptId = parseInt(req.params.deptId);
    const db = client.db(dbName);
    const collection = db.collection('infrastructure');

    try {
        const result = await collection.findOne({ dept_id: deptId });

        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ error: "No infrastructure details found for the given department ID." });
        }
    } catch (error) {
        console.error("Error fetching infrastructure details:", error);
        res.status(500).json({ error: "Error fetching infrastructure details" });
    }
});

//Student Records
app.get('/api/student-activities/:deptId', async (req, res) => {
    const deptId = parseInt(req.params.deptId);
    const db = client.db(dbName);
    const collection = db.collection('student_activities');

    try {
        const result = await collection.findOne({ dept_id: deptId });

        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ error: "No student activities found for the given department ID." });
        }
    } catch (error) {
        console.error("Error fetching student activities:", error);
        res.status(500).json({ error: "Error fetching student activities" });
    }
});

// Support Staff Details
app.get('/api/support-staff/:deptId', async (req, res) => {
    const deptId = req.params.deptId;
    const db = client.db(dbName);
    const collection = db.collection('support_staffs');

    try {
        const result = await collection.findOne({
            "supporting_staff.Unique_id": { $regex: `^VEC-${deptId}-` }
        });

        if (result && result.supporting_staff.length > 0) {
            const filteredStaff = result.supporting_staff.filter(staff =>
                staff.Unique_id.startsWith(`VEC-${deptId}-`)
            );
            res.status(200).json(filteredStaff);
        } else {
            res.status(404).json({ message: 'No support staff found for the given department ID.' });
        }
    } catch (error) {
        console.error("❌ Error fetching support staff details:", error);
        res.status(500).json({ error: "Error fetching support staff details" });
    }
});

// MOUs Details Endpoint

app.get('/api/mous/:deptId/:uniqueId?', async (req, res) => {
    const { deptId, uniqueId } = req.params;
    const db = client.db(dbName);
    const collection = db.collection('MOUs');

    try {
        const departmentData = await collection.findOne({
            Departments: deptId
        });
        if (!departmentData) {
            return res.status(404).json({ message: "Department not found" });
        }

        const departmentMOUs = departmentData.MOUs;

        if (uniqueId) {
            const filteredMOUs = departmentMOUs.filter(mou =>
                mou.unique_id.toString() === uniqueId
            );

            if (filteredMOUs.length > 0) {
                return res.status(200).json(filteredMOUs);
            } else {
                return res.status(404).json({ message: "No MOU found with the provided unique_id or year." });
            }
        }

        const uniqueIdsList = departmentMOUs.map(mou => mou.unique_id);
        return res.status(200).json({ unique_ids: uniqueIdsList });

    } catch (error) {
        console.error("❌ Error fetching MOUs:", error);
        res.status(500).json({ error: "Error fetching MOUs" });
    }
});

// Department Activities Endpoint
app.get('/api/department_activities/:deptId', async (req, res) => {
    const { deptId } = req.params;
    const db = client.db(dbName);
    const collection = db.collection('department_activities');

    try {
        const departmentData = await collection.findOne({ dept_id: deptId });

        if (!departmentData) {
            console.log("❌ Department not found for dept_id:", deptId);
            return res.status(404).json({ message: "Department not found" });
        }
        const sortedActivities = departmentData.dept_activities.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB - dateA;
        });
        return res.status(200).json({
            department_name: departmentData.department_name,
            dept_activities: sortedActivities
        });

    } catch (error) {
        console.error("❌ Error fetching department activities:", error);
        res.status(500).json({ error: "Error fetching department activities" });
    }
});

// Curriculum 
app.get('/api/curriculum/:deptId', async (req, res) => {
    const { deptId } = req.params;
    const db = client.db(dbName);
    const collection = db.collection('curriculum');

    try {
        const departmentData = await collection.findOne({ dept_id: deptId });
        if (!departmentData) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.status(200).json(departmentData);

    } catch (error) {
        console.error("❌ Error fetching curriculum data:", error);
        res.status(500).json({ error: "Error fetching curriculum data" });
    }
});

//get reseatch department data
app.post('/api/fetch_dept_research_data', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('department_research_data');
        const { dept_id } = req.body;
        const dept_data = await collection.findOne({ department_id : dept_id }).toArray();
        res.status(200).json(dept_data);
    } catch (error) {
        console.error("❌ Error fetching recent events:", error);
        res.status(500).json({ error: "Error fetching recent events" });
    }
});

// Fetch Recent 5 Events
app.get('/api/events/recent', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('events');

    try {
        const recentEvents = await collection.aggregate([
            { $unwind: "$events" },
            { $sort: { "events.date": -1 } },
            { $limit: 10 },
            { $replaceRoot: { newRoot: "$events" } }
        ]).toArray();

        if (recentEvents.length === 0) {
            return res.status(404).json({ message: "No events found" });
        }

        res.status(200).json(recentEvents);

    } catch (error) {
        console.error("❌ Error fetching recent events:", error);
        res.status(500).json({ error: "Error fetching recent events" });
    }
});


// Fetch announcements
app.get('/api/announcements', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('announcements');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});

// Fetch Special announcements
app.get('/api/special_announcements', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('special_announcement');

    try {
        const nominationDetails = await collection.find({}).toArray();
        if (nominationDetails.length === 0) {
            return res.status(404).json({ message: "No special_announcement details found" });
        }
        res.status(200).json(nominationDetails);
    } catch (error) {
        console.error("❌ Error fetching special_announcement details:", error);
        res.status(500).json({ error: "Error fetching special_announcement details" });
    }
});

// Fetch Principal Details
app.get('/api/principal', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('principal_data');

    try {
        const principalDetails = await collection.findOne({});
        if (!principalDetails) {
            return res.status(404).json({ message: "Principal details not found" });
        }
        res.status(200).json(principalDetails);
    } catch (error) {
        console.error("❌ Error fetching principal details:", error);
        res.status(500).json({ error: "Error fetching principal details" });
    }
});

//Admin Office
app.get('/api/admin_office', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('admin_office');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});

//Committee
app.get('/api/committee', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('committee');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});

//Regulations
app.get('/api/regulation', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('regulation');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});

// Endpoint to fetch details for UG and UG_Lateral
app.get('/api/ug_and_ug_lateral', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('Intakes');

    try {
        const data = await collection.findOne({}, { projection: { UG: 1, UG_Lateral: 1, _id: 0 } });
        if (!data) {
            return res.status(404).json({ message: 'No UG and UG_Lateral details found' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Error fetching UG and UG_Lateral details:', error);
        res.status(500).json({ error: 'Error fetching UG and UG_Lateral details' });
    }
});

// Endpoint to fetch details for PG
app.get('/api/pg', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('Intakes');

    try {
        const data = await collection.findOne({}, { projection: { PG: 1, _id: 0 } });
        if (!data) {
            return res.status(404).json({ message: 'No PG details found' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Error fetching PG details:', error);
        res.status(500).json({ error: 'Error fetching PG details' });
    }
});

// Endpoint to fetch details for MBA
app.get('/api/mba', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('Intakes');

    try {
        const data = await collection.findOne({}, { projection: { MBA: 1, _id: 0 } });
        if (!data) {
            return res.status(404).json({ message: 'No MBA details found' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Error fetching MBA details:', error);
        res.status(500).json({ error: 'Error fetching MBA details' });
    }
});

// Placement Team
app.get('/api/placement_team', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('placement_team');

    try {
        const placementTeam = await collection.find({}).toArray();
        if (placementTeam.length === 0) {
            return res.status(404).json({ message: 'No placement team data found' });
        }
        res.status(200).json(placementTeam);
    } catch (error) {
        console.error('❌ Error fetching placement team data:', error);
        res.status(500).json({ error: 'Error fetching placement team data' });
    }
});

//dean_and_associates
app.get('/api/dean_and_associates', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('dean_and_associates');

    try {
        const deansData = await collection.find({}).toArray();
        if (deansData.length === 0) {
            return res.status(404).json({ message: 'No deans data found' });
        }
        res.status(200).json(deansData);
    } catch (error) {
        console.error('❌ Error fetching deans data:', error);
        res.status(500).json({ error: 'Error fetching deans data' });
    }
});

//Placements Data
app.get('/api/placements_data', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('placements_data');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});

//all_forms
app.get('/api/all_forms', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('all_forms');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});

//curriculum_and_syllabus
app.get('/api/curriculum_and_syllabus', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('curriculum_and_syllabus');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No curriculum or syllabus found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching curriculum and syllabus', error);
        res.status(500).json({ error: 'Error fetching curriculum and syllabus' });
    }
});

//alumni
app.get('/api/alumni', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('alumni');

    try {
        const alumniData = await collection.find({}).toArray();
        if (alumniData.length === 0) {
            return res.status(404).json({ message: 'No alumni data found' });
        }
        res.status(200).json(alumniData);
    } catch (error) {
        console.error('❌ Error fetching alumni data:', error);
        res.status(500).json({ error: 'Error fetching alumni data' });
    }
});

//banner
app.get('/api/banner', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('banner');

    try {
        const bannersData = await collection.find({}).toArray();
        if (bannersData.length === 0) {
            return res.status(404).json({ message: 'No banners found' });
        }
        res.status(200).json(bannersData);
    } catch (error) {
        console.error('❌ Error fetching banners:', error);
        res.status(500).json({ error: 'Error fetching banners' });
    }
});

//Staff Details
app.get('/api/staff_details/:unique_id', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('staff_details');
        const uniqueId = req.params.unique_id;

        const facultyData = await collection.findOne({ unique_id: uniqueId });

        if (!facultyData) {
            return res.status(404).json({ message: 'Faculty data not found' });
        }
        const convertedData = {
            "_id": facultyData["unique_id"], 
            "Name": facultyData["Name"],
            "Surname": facultyData["Initial or Surname"],
            "Designation": facultyData["Designation"],
            "Joined_in": facultyData["Joined in"],
            "Department_Name": facultyData["Department Name"],
            "Mail_ID": facultyData["Mail ID"],
            "Photo": `/static/images/profile_photos/${facultyData["unique_id"]}.jpg`,
            "Google_Scholar_Profile": facultyData["Google Scholar Profile"],
            "Research_Gate": facultyData["Research Gate"],
            "Orchid_Profile": facultyData["Orchid Profile"] || null,
            "Publon_Profile": facultyData["Publon Profile"] || null,
            "Scopus_Author_Profile": facultyData["Scopus Author Profile"],
            "LinkedIn_Profile": facultyData["LinkedIn Profile"],
            "Professional_Membership": facultyData["Professional Membership"] || null,
            "Sponsored_Projects": facultyData["Sponsored Projects"],
            "Patent_Granted": facultyData["Patent Granted"],
            "Patent_Published": facultyData["Patent Published"],
            "Patent_Filed": facultyData["Patent Filed"] || null,
            "Journal_Publications": facultyData["Journal Publications"],
            "Conference_Publications": facultyData["Conference Publications"],
            "Book_Chapter_Published": facultyData["Book Chapter Published"],
            "Guest_Lectures_Delivered": facultyData["Guest Lectures Delivered"],
            "Guest_Lectures_Attended": facultyData["Guest Lectures Attended"] || null,
            "Guest_Lectures_Organized": facultyData["Guest Lectures Organized"],
            "PHD_Produced": facultyData["PHD Produced"] || null,
            "PHD_Pursuing": facultyData["PHD Pursuing"] || null,
            "Upload_Your_Excel_File_Here": facultyData["Upload Your Excel File Here"],
            "unique_id": facultyData["unique_id"],
            "EDUCATIONAL_QUALIFICATION": facultyData["EDUCATIONAL_QUALIFICATION"].map(qual => ({
                "DEGREE": qual["DEGREE"],
                "BRANCH": qual["BRANCH"],
                "INSTITUTE": qual["INSTITUTE"],
                "YEAR": qual["YEAR"]
            })),
            "EXPERIENCE": facultyData["EXPERIENCE"]
                .filter(exp => exp.DURATION !== "From")
                .map(exp => ({
                    "From": exp["DURATION"] === "TOTAL" ? null : exp["DURATION"],
                    "TO": exp["Unnamed:_1"] === "TO" ? null : exp["Unnamed:_1"],
                    "YEARS": exp["EXPERIENCE"] === "NO.OF.YEARS" || exp["EXPERIENCE"] === "-" ? null : exp["EXPERIENCE"],
                    "MONTHS": exp["Unnamed:_3"] === "NO.OF MONTHS" || exp["Unnamed:_3"] === "-" ? null : exp["Unnamed:_3"],
                    "DESIGNATION": exp["DESIGNATION"] || null,
                    "INSTITUTION": exp["INSTITUTION"] || null
                })),
            "CONFERENCE_PUBLICATIONS": facultyData["CONFERENCE_PUBLICATIONS"].map(pub => ({
                "AUTHORS": pub["AUTHORS"],
                "PAPER_TITLE": pub["PAPER_TITLE"],
                "CONFERENCE_NAME": pub["CONFERENCE_NAME"],
                "ORGANIZED_BY": pub["ORGANIZED_BY"],
                "book_number": pub["book_number"] || "-",
                "MONTH_&YEAR": pub["MONTH&_YEAR"]
            })),
            "BOOK_PUBLICATIONS": facultyData["BOOK_PUBLICATIONS"].map(pub => ({
                "AUTHOR": pub["AUTHOR"],
                "BOOK_NAME,_EDITION": pub["BOOK_NAME,_EDITION"],
                "PUBLISHER": pub["PUBLISHER"],
                "ISBN_/ISSN_NO": pub["ISBN/_ISSN_NO"],
                "MONTH_&YEAR": pub["MONTH&_YEAR"],
                "BOOK": pub["BOOK"]
            })),
            "PATENTS": facultyData["PATENTS"] || [],
            "PROJECTS": facultyData["PROJECTS"].map(project => ({
                "TITLE": project["TITLE"],
                "SPONSORING_AGENCY": project["SPONSORING_AGENCY"],
                "AMOUNT": project["AMOUNT"],
                "YEAR_OF_SANCTION": project["YEAR_OF_SANCTION"],
                "DURATION": project["DURATION"],
                "RESPONSIBILITY": project["RESPONSIBILITY"],
                "STATUS": project["STATUS"]
            })),
            "JOURNAL_PUBLICATIONS": facultyData["JOURNAL_PUBLICATIONS"].map(pub => ({
                "AUTHORS": pub["AUTHORS"],
                "PAPER_TITLE": pub["PAPER_TITLE"],
                "JOURNAL_NAME": pub["JOURNAL_NAME"],
                "DOI_NUMBER": pub["DOI_NUMBER"],
                "PAGE_NO": pub["PAGE_NO"] || "-",
                "VOL_NO": pub["VOL_NO"] || "-",
                "MONTH_&YEAR": pub["MONTH&_YEAR"],
                "INDEXED": pub["INDEXED"]
            })),
            "RESEARCH_SCHOLARS": facultyData["RESEARCH_SCHOLARS"] || []
        };
        res.json(convertedData);
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        res.status(500).json({ message: 'Error fetching faculty data' });
    }
});

//NBA
app.get('/api/nba', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('nba');

    try {
        const alumniData = await collection.find({}).toArray();
        if (alumniData.length === 0) {
            return res.status(404).json({ message: 'No nba data found' });
        }
        res.status(200).json(alumniData);
    } catch (error) {
        console.error('❌ Error fetching alumni data:', error);
        res.status(500).json({ error: 'Error fetching nba data' });
    }
});

//NAAC
app.get('/api/naac', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('naac');
    try {
        const NAACData = await collection.find({}).toArray();
        if (NAACData.length === 0) {
            return res.status(404).json({ message: 'No NAAC data found' });
        }
        res.status(200).json(NAACData);
    } catch (error) {
        console.error('❌ Error fetching NAAC data:', error);
        res.status(500).json({ error: 'Error fetching NAAC data' });
    }
});

//NIRF
app.get('/api/nirf', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('nirf');
    try {
        const NIRFData = await collection.find({}).toArray();
        if (NIRFData.length === 0) {
            return res.status(404).json({ message: 'No NIRF data found' });
        }
        res.status(200).json(NIRFData);
    } catch (error) {
        console.error('❌ Error fetching NIRF data:', error);
        res.status(500).json({ error: 'Error fetching NIRF data' });
    }
});

//iic contents
app.get('/api/iic', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('iic');

        const data = await collection.findOne({}); 

        if (!data) {
            return res.status(404).json({ message: "No data found" });
        }

        res.json(data); 
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error"});
    }
});

//Sidebar
app.get('/api/sidebar/:deptid', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('sidebar');
    const deptid = req.params.deptid;

    try {
        const departmentData = await collection.findOne({ deptId: deptid });
        if (!departmentData) {
            return res.status(404).json({ message: `No data found for deptId: ${deptid}` });
        }

        res.status(200).json(departmentData);
    } catch (error) {
        console.error('❌ Error fetching department data:', error);
        res.status(500).json({ error: 'Error fetching department data' });
    }
});

//NCC ARMY
app.get('/api/army', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('army');
    try {
        const Data = await collection.find({}).toArray();
        if (Data.length === 0) {
            return res.status(404).json({ message: 'No navy data found' });
        }
        res.status(200).json(Data);
    } catch (error) {
        console.error('❌ Error fetching navy data:', error);
        res.status(500).json({ error: 'Error fetching armydata' });
    }
});

//Ncc NAVY
app.get('/api/navy', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('navy');
    try {
        const NAVYData = await collection.find({}).toArray();
        if (NAVYData.length === 0) {
            return res.status(404).json({ message: 'No navy data found' });
        }
        res.status(200).json(NAVYData);
    } catch (error) {
        console.error('❌ Error fetching navy data:', error);
        res.status(500).json({ error: 'Error fetching navy data' });
    }
});

//NSS ENDPOINT START (OLD ENDPOINTS)

//Signup
app.get('/api/nss_members', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('nss_members');
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const joiningTime = new Date().toISOString();

        const profilePhotoPath = `/static/images/nss_members/${req.body.name}.jpg`;

        const newMember = {
            ...req.body,
            password: hashedPassword,
            adminauth: false,
            joining_time: joiningTime,
            profile_photo_path: profilePhotoPath
        };

        const result = await collection.insertOne(newMember);
        res.status(201).json({ message: 'Member added successfully', memberId: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

//nss_profile_data
app.get('/api/nss_profile_member/:nss_id', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('nss_members');
        const nssId = req.params.nss_id;
        const member = await collection.findOne({ nss_id: nssId });

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.status(200).json(member);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//signin
app.get('/api/nss_signin', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('nss_members');

        const { email, password } = req.body;
        const user = await collection.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.nss_id = user.nss_id;
        req.session.auth = true;
        req.session.adminauth = user.adminauth || false;

        const { password: _, ...userData } = user;

        res.status(200).json({ message: 'Sign-in successful', user: userData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//nsslogout
app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

//Nsspodcst
app.get('/api/Nsspodacast', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('nsspodcast');
        const podcasts = await collection.find({}).toArray();

        res.json({ podcasts });
    } catch (error) {
        console.error('Error fetching podcast data:', error);
        res.status(500).json({ message: 'Error fetching podcast data' });
    }
});

//nsshome
app.get('/api/nss_home', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('nsshome');

    try {
        const nssHomeData = await collection.find({}).toArray();
        if (nssHomeData.length === 0) {
            return res.status(404).json({ message: 'No NSS home data found' });
        }
        res.status(200).json(nssHomeData);
    } catch (error) {
        console.error('❌ Error fetching NSS home data:', error);
        res.status(500).json({ error: 'Error fetching NSS home data' });
    }
});

//nss gallery
app.get('/api/nss_gallery/:year', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('nssgallery');

        const { year } = req.params;
        const galleryData = await collection.findOne({ Year: year });

        if (!galleryData) {
            return res.status(404).json({ error: `No data found for year ${year}` });
        }

        res.status(200).json({ year: year, data: galleryData.data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//insert nss events
app.post('/api/nssevents', async (req, res) => {
    try {
        if (!req.session.auth || !req.session.adminauth) {
            return res.status(403).json({ error: 'Access denied. Admin authentication required.' });
        }
        const db = client.db(dbName);
        const collection = db.collection('nssevents');
        const { title, description, placeofevent, starttime, date, branch } = req.body;

        if (!title || !description || !placeofevent || !starttime || !date || !branch) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const newEvent = {
            title,
            description,
            placeofevent,
            starttime,
            date,
            branch,
            adminid: req.session.nss_id,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newEvent);
        res.status(201).json({ message: 'Event added successfully', eventId: result.insertedId });

    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ message: 'Error adding event' });
    }
});

//newsletter fetching
app.get('/api/nssevents', async (req, res) => {
    try {
        if (!req.session.auth) {
            return res.status(403).json({ error: 'Access denied. Authentication required.' });
        }
        const db = client.db(dbName);
        const collection = db.collection('nssevents');

        const newsletters = await collection.find().sort({ createdAt: -1 }).toArray();

        if (newsletters.length === 0) {
            return res.status(404).json({ error: 'No newsletters found' });
        }
        res.status(200).json({ newsletters });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//nss faculty
app.get('/api/nss_faculty', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('nss_faculty');

    try {
        const nssHomeData = await collection.find({}).toArray();
        if (nssHomeData.length === 0) {
            return res.status(404).json({ message: 'No NSS home data found' });
        }
        res.status(200).json(nssHomeData);
    } catch (error) {
        console.error('❌ Error fetching NSS home data:', error);
        res.status(500).json({ error: 'Error fetching NSS home data' });
    }
});

//newsletter insertion
app.post('/api/nss_newsletter', async (req, res) => {
    try {
        if (!req.session.auth || !req.session.adminauth) {
            return res.status(403).json({ error: 'Access denied. Admin authentication required.' });
        }
        const db = client.db(dbName);
        const collection = db.collection('nssnewsletter');

        const { title, description, file_path } = req.body;

        if (!title || !description || !file_path) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newNewsletter = {
            title,
            description,
            file_path,
            uploaded_by: req.session.nss_id,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newNewsletter);
        res.status(201).json({ message: 'Newsletter added successfully', newsletterId: result.insertedId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//newsletter fetching
app.get('/api/nss_newsletter', async (req, res) => {
    try {
        if (!req.session.auth) {
            return res.status(403).json({ error: 'Access denied. Authentication required.' });
        }
        const db = client.db(dbName);
        const collection = db.collection('nssnewsletter');

        const newsletters = await collection.find().sort({ createdAt: -1 }).toArray();

        if (newsletters.length === 0) {
            return res.status(404).json({ error: 'No newsletters found' });
        }
        res.status(200).json({ newsletters });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//NSS ENDPOINT END (OLD ENDPOINTS)

//Sports Zonal Data
app.get('/api/sports_data', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('sports_data');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No Sports data found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching Sports data:', error);
        res.status(500).json({ error: 'Error fetching Sports data' });
    }
});

app.get('/api/library', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('library');

    try {
        const libraryData = await collection.find({}).toArray();
        if (libraryData.length === 0) {
            return res.status(404).json({ message: 'No library data found' });
        }
        res.status(200).json(libraryData);
    } catch (error) {
        console.error('❌ Error fetching library data:', error);
        res.status(500).json({ error: 'Error fetching library data' });
    }
});

//greveince endpoint
app.post('/api/get_grevience', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const grevienceCollection = db.collection("grevience_database");
        const { email, subject, content } = req.body;
        if (!email || !subject || !content) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const grevienceData = {
            email,
            subject,
            content,
            submitted_at: new Date()
        };
        await grevienceCollection.insertOne(grevienceData);
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.BASE_EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.BASE_EMAIL,
            to: process.env.TARGET_EMAIL,
            subject: `New Grievance Submitted: ${subject}`,
            text: `You have received a new grievance from ${email}.\n\nMessage:\n${content}\n\nPlease address it as soon as possible.`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Grievance submitted successfully and email notification sent" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//fetch NSS Data
app.get('/api/fetch_nss_data', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const nssCollection = db.collection("nss_data");
        const nss_data = await nssCollection.find({}).toArray();

        if (nss_data.length === 0) {
            return res.status(204).send();
        }

        return res.status(200).json(nss_data);
    } catch (error) {
        console.error("Error fetching NSS data:", error);
        return res.status(500).json({ error: "Internal server error" });
    } 
});

//Fetch YRC data
app.get('/api/fetch_yrc_data', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const yrcCollection = db.collection("yrc_data");
        const yrc_data = await yrcCollection.find({}).toArray();

        if (yrc_data.length === 0) {
            return res.status(204).send();
        }

        return res.status(200).json(yrc_data);
    } catch (error) {
        console.error("Error fetching NSS data:", error);
        return res.status(500).json({ error: "Internal server error" });
    } 
});

// Endpoint to fetch research data based on category
app.post("/api/get_research_data", async (req, res) => {
    const { category } = req.body;

    if (!category) {
        return res.status(400).json({ error: "Category is required" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("overall_research");
        const result = await collection.findOne({}, { projection: { [category]: 1, _id: 0 } });

        if (!result || !result[category]) {
            return res.status(404).json({ error: "Category not found" });
        }

        return res.status(200).json(result[category]);
    } catch (error) {
        console.error("Error fetching research data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to fetch all warden data
app.get("/api/get_warden_data", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_profile");

        const warden_details = await wardenCollection.find({}).toArray();

        if (!warden_details || warden_details.length === 0) {
            return res.status(404).json({ message: "No wardens found" });
        }

        res.status(200).json({ wardens: warden_details });

    } catch (error) {
        console.error("❌ Error fetching data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to fetch IQAC data
app.get("/api/iqac", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("IQAC");

        const data = await collection.find({}).toArray();

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }

        res.status(200).json({ data: data });
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

//newsletter
app.get('/api/NewsLetters', async (req,res) => {
    const deptId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('news_letter');

    try {
        const result = await collection.findOne({ dept_id: "001" });

        if (result) {
            return res.status(200).json(result);
        } else {
            res.status(404).json({ error: "No news letter found for the given department ID." });
        }
    } catch (error) {
        console.error("Error fetching news letter", error);
        res.status(500).json({ error: "Error fetching news letter" });
    }
});

//fetch active session
app.get('/api/session', (req, res) => {
    if (req.session.nss_id && req.session.auth) {
        return res.json({ 
            nss_id: req.session.nss_id, 
            auth: req.session.auth,
            adminauth: req.session.adminauth || false // Default to false if not set
        });
    }
    res.status(401).json({ error: 'Not authenticated' });
});

//overall patents
app.get('/api/patents', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('overall_patent');  // Replace with your collection name

        const patentData = await collection.find({}).toArray();
        if (patentData.length === 0) {
            return res.status(404).json({ message: 'No patent data found' });
        }
        res.status(200).json(patentData);

    } catch (error) {
        console.error('❌ Error fetching patent data:', error);
        res.status(500).json({ error: 'Error fetching patent data' });
    } finally {
        await client.close();
    }
});

//overall conference publication
app.get('/api/overall_conference_publication', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('overall_conference_publication');  // Replace with your collection name

        const patentData = await collection.find({}).toArray();
        if (patentData.length === 0) {
            return res.status(404).json({ message: 'No overall conference publication found' });
        }
        res.status(200).json(patentData);

    } catch (error) {
        console.error('❌ Error fetching overall conference publication:', error);
        res.status(500).json({ error: 'Error fetching overall conference publication' });
    } finally {
        await client.close();
    }
});

//overall overall journal publications
app.get('/api/overall_journal_publications', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('overall_journal_publications');  // Replace with your collection name

        const patentData = await collection.find({}).toArray();
        if (patentData.length === 0) {
            return res.status(404).json({ message: 'No overall journal publications found' });
        }
        res.status(200).json(patentData);

    } catch (error) {
        console.error('❌ Error fetching overall journal publications:', error);
        res.status(500).json({ error: 'Error fetching overall journal publications' });
    } finally {
        await client.close();
    }
});


//overall book publication
app.get('/api/overall_book_publication', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('overall_book_publication');  // Replace with your collection name

        const patentData = await collection.find({}).toArray();
        if (patentData.length === 0) {
            return res.status(404).json({ message: 'No overall book publication found' });
        }
        res.status(200).json(patentData);

    } catch (error) {
        console.error('❌ Error fetching overall book publication:', error);
        res.status(500).json({ error: 'Error fetching overall book publication' });
    } finally {
        await client.close();
    }
});

//coe endpoint
app.get('/api/coe', async (req, res) => {
    try {
        await client.connect();
        console.log("Mongo db connected");
        
        const db = client.db(dbName);
        const collection = db.collection('COE');  // This is your MongoDB collection name

        const coeData = await collection.find({}).toArray();

        if (coeData.length === 0) {
            return res.status(404).json({ message: 'No COE data found' });
        }

        res.status(200).json(coeData);

    } catch (error) {
        console.error('❌ Error fetching COE data:', error);
        res.status(500).json({ error: 'Error fetching COE data' });
    } finally {
        await client.close();
    }
});

// Academi calender
 app.get('/api/academic', async (req, res) => {
      try {
        const db = client.db(dbName);
        const collection = db.collection('academic_calender');

        // Fetch the calendar document
        const calendar = await collection.findOne();

        if (!calendar || !calendar.year || calendar.year.length === 0) {
          return res.status(404).json({ message: 'No calendar data found' });
        }

        res.status(200).json(calendar);
      } catch (error) {
        console.error('❌ Error fetching calendar:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

//about_placement
    app.get('/api/about_placement', async (req, res) => {
      try {
        const db = client.db(dbName);
        const collection = db.collection('about_placement');

        const aboutData = await collection.findOne();

        if (!aboutData || Object.keys(aboutData).length === 0) {
          return res.status(404).json({ message: 'No about placement data found' });
        }

        res.status(200).json(aboutData);
      } catch (error) {
        console.error('❌ Error fetching about placement data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

app.get('/api/about_us', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('about_us');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});




app.get('/api/organization_chart', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('organization_chart');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No organization chart found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching organization chart:', error);
        res.status(500).json({ error: 'Error fetching organization chart' });
    }
});


app.get('/api/hostel_menu', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('hostel_menu');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});


app.get('/api/help_desk', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('help_desk');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});

//admin page details
app.get('/api/landing_page_data', async (req, res) => {
  try {
    const db = client.db(dbName);
    const config = await db.collection('landing_page_details').findOne({});

    if (!config) {
      return res.status(404).json({ error: 'Landing page data not found' });
    }

    const { _id, notifications = [], ...rest } = config;
    const activeNotifications = notifications.filter(n => n.status === 'active');

    const cleanedConfig = {
      ...rest,
      notifications: activeNotifications
    };

    res.json(cleanedConfig);
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//programmes_list
app.get('/api/programmes_list', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('programmes_list');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No programmes list found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching programmes list:', error);
        res.status(500).json({ error: 'Error fetching programmes list' });
    }
});
//Department_list
app.get('/api/departments_list', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('departments_list');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
});

app.get('/api/admission_team', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('admission_team');

    try {
        const admission_team = await collection.find({}).toArray();
        if (admission_team.length === 0) {
            return res.status(404).json({ message: 'No admission team data  found' });
        }
        res.status(200).json(admission_team);
    } catch (error) {
        console.error('❌ Error fetching admission team:', error);
        res.status(500).json({ error: 'Error fetching admission team' });
    }
});

app.get('/api/E-cell', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('e_cell');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No E-cell list found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching e-cell list:', error);
        res.status(500).json({ error: 'Error fetching programmes list' });
}
});

//handbook
app.get('/api/handbook', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('handbook');

    try {
        const handbookData = await collection.find({}).toArray();
        if (handbookData.length === 0) {
            return res.status(404).json({ message: 'No handbook data found' });
        }   
        res.status(200).json(handbookData);
    } catch (error) {
        console.error('❌ Error fetching handbook data:', error);
        res.status(500).json({ error: 'Error fetching handbook data' });
    }
});


app.get('/api/gallery', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('gallery');

    try {
        const galleryData = await collection.find({}).toArray();
        if (galleryData.length === 0) {
            return res.status(404).json({ message: 'No gallery data found' });
        }   
        res.status(200).json(galleryData);
    } catch (error) {
        console.error('❌ Error fetching gallery data:', error);
        res.status(500).json({ error: 'Error fetching gallery data' });
    }
});


app.post('/api/get_incubationcell_data', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const inccellappCollection = db.collection("inccellapp_data");
        const {name,phno,email,content} = req.body;
       

        if (!name || !phno || !email || !content) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const inccellapp_data = {
            name,
            phno,
            email,
            content,
            submitted_at: new Date()
        };
        await inccellappCollection.insertOne(inccellapp_data);
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.BASE_EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.BASE_EMAIL,
            to: process.env.ICELL_TARGET_EMAIL,
            subject: `New Incubation Cell Application Submitted`,
            text: `You have received a new application from ${email}.\n\nName:${name}\n\nContact:${phno}\n\nMessage:\n${content}\n\nPlease address it as soon as possible.`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Incubation Cell Application Data submitted successfully and email notification sent" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


