const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

// Fetch Vision & Mission
async function getVisionMission(req, res) {
    const departmentId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('vision_and_mission');

    try {
        const result = await collection.findOne({ dept_id: departmentId });
        if (result) {
            return res.json(result);
        } else {
            res.status(404).json({ error: "Department not found" });
        }
    } catch (error) {
        console.error("Error fetching vision and mission data:", error);
        await logError(req, error, 'Error fetching vision and mission Data', 500);
        res.status(500).json({ error: "Error fetching vision_and_mission data" });
    }
}

// Fetch HOD Details
async function getHODDetails(req, res) {
    const departmentId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('HODS');

    try {
        const hod = await collection.findOne({
            Unique_id: { $regex: `VEC-${departmentId}-` }
        });

        if (hod) {
            return res.json(hod);
        } else {
            res.status(404).json({ error: "HOD not found for this department." });
        }
    } catch (error) {
        console.error("Error fetching HOD details:", error);
        await logError(req, error, 'Error fetching HOD details', 500);
        res.status(500).json({ error: "Error fetching HOD details" });
    }
}

// Fetch Staff Details
async function getStaffDetails(req, res) {
    const deptId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('faculty_data');

    try {
        const staffDetails = await collection.findOne({ dept_id: deptId });

        if (staffDetails) {
            res.status(200).json(staffDetails);
        } else {
            res.status(404).json({ message: 'No staff details found for the given department ID.' });
        }
    } catch (error) {
        console.error("Error fetching staff details:", error);
        await logError(req, error, 'Error fetching staff details', 500);
        res.status(500).json({ error: "Error fetching staff details" });
    }
}

// Fetch Curriculum 
async function getSyllabus(req, res) {
    const departmentId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('curriculum');

    try {
        const curriculum = await collection.findOne({ dept_id: departmentId });
        if (!curriculum) {
            return res.status(404).json({ message: "Department not found" });
        }
        return res.status(200).json(curriculum);

    } catch (error) {
        console.error("Error fetching curriculum data:", error);
        await logError(req, error, 'Error fetching curriculum details', 500);
        res.status(500).json({ error: "Error fetching curriculum data" });
    }
}

// Fetch News Letter Details
async function getNewsLetters(req, res) {
    const deptId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('news_letter');

    try {
        const result = await collection.findOne({ dept_id: deptId });

        if (result) {
            return res.status(200).json(result);
        } else {
            res.status(404).json({ error: "No news letter found for the given department ID." });
        }
    } catch (error) {
        console.error("Error fetching news letter", error);
        await logError(req, error, 'Error fetching news letter details', 500);
        res.status(500).json({ error: "Error fetching news letter" });
    }
}

// Fetch Infrastructure
async function getInfrastructure(req, res) {
    const deptId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('infrastructure');

    try {
        const result = await collection.findOne({ dept_id: deptId });

        if (result) {
            return res.status(200).json(result);
        } else {
            res.status(404).json({ error: "No infrastructure details found for the given department ID." });
        }
    } catch (error) {
        console.error("Error fetching infrastructure details:", error);
        await logError(req, error, 'Error fetching infrastructure details', 500);
        res.status(500).json({ error: "Error fetching infrastructure details" });
    }
}

// Fetch Department Activities 
async function getDeptActivities(req, res) {
    const deptId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('department_activities');

    try {
        const departmentData = await collection.findOne({ dept_id: deptId });

        if (!departmentData) {
            return res.status(404).json({ message: "Department not found" });
        }

        const sortedActivities = departmentData.dept_activities.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });

        return res.status(200).json({
            department_name: departmentData.department_name,
            activities: sortedActivities,
            dept_id: departmentData.dept_id
        });

    } catch (error) {
        console.error("Error fetching department activities:", error);
        await logError(req, error, 'Error fetching department activities details', 500);
        res.status(500).json({ error: "Error fetching department activities" });
    }
}

// Fetch Student Activities
async function getStuActivities(req, res) {
    const deptId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('student_activities');

    try {
        const result = await collection.findOne({ dept_id: deptId });

        if (result) {
            return res.status(200).json(result);
        } else {
            res.status(404).json({ error: "No student activities found for the given department ID." });
        }
    } catch (error) {
        console.error("Error fetching student activities:", error);
        await logError(req, error, 'Error fetching student activities details', 500);
        res.status(500).json({ error: "Error fetching student activities" });
    }
}

// Fetch  MOUs Details 
async function getMou(req, res) {
    const deptId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('MOUs');

    try {
        const departmentData = await collection.findOne({
            dept_id: deptId       
        });

        if (!departmentData) {
            return res.status(404).json({ message: "Department not found" });  //for the new push directly return the departmentData
        }
        
        return res.status(200).json(departmentData);
    } catch (error) {
        console.error("Error fetching MOUs:", error);
        await logError(req, error, 'Error fetching MOUs details', 500);
        res.status(500).json({ error: "Error fetching MOUs" });
    }
}

async function getslidebar (req, res) {
    const db = getDb();
    const collection = db.collection('sidebar');
    const deptid = req.params.deptId;

    try {
        const sidebar = await collection.findOne({ dept_id: deptid });

        if (!sidebar) {
            return res.status(404).json({ message: `No data found for deptId: ${deptid}` });
        }
        res.status(200).json(sidebar);
    } catch (error) {
        console.error('Error fetching sidebar data:', error);
        await logError(req, error, 'Error fetching sidebar data', 500);
        res.status(500).json({ error: 'Error fetching sidebar data' });
    }
}

module.exports = {
    getVisionMission,
    getHODDetails,
    getStaffDetails,
    getInfrastructure,
    getSyllabus,
    getDeptActivities,
    getStuActivities,
    getMou,
    getslidebar,
    getNewsLetters
};
