const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

const deptMap = {
    "001": "001",
    "002": "AUTO_002",
    "003": "Chemistry_003",
    "004":"",
    "005":"",
};

async function getVisionMission1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        const result = await collection.findOne({ type: "vision_and_mission" });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: "Vision and mission not found" });
        }
    } catch (error) {
        console.error("Error fetching vision and mission data:", error);
        await logError(req, error, 'Error fetching vision and mission Data', 500);
        res.status(500).json({ error: "Error fetching vision and mission data" });
    }
}


async function getHODDetails1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        const hod = await collection.findOne({ type: "hod" });
        if (hod) {
            res.json(hod);
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
async function getStaffDetails1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        const result = await collection.findOne({ type: "faculty" });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: "No staff details found for the given department ID." });
        }
    } catch (error) {
        console.error("Error fetching staff details:", error);
        await logError(req, error, 'Error fetching staff details', 500);
        res.status(500).json({ error: "Error fetching staff details" });
    }
}

async function getSyllabus1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        // Fetch document with type curriculum_and_syllabus
        const curriculum = await collection.findOne({ type: "curriculum_and_syllabus" });
        if (!curriculum) {
            return res.status(404).json({ message: "Syllabus not found for this department." });
        }
        return res.status(200).json(curriculum);
    } catch (error) {
        console.error("Error fetching curriculum data:", error);
        await logError(req, error, 'Error fetching curriculum details', 500);
        res.status(500).json({ error: "Error fetching curriculum data" });
    }
}

async function getNewsLetters1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        // Fetch document with type newsletter
        const result = await collection.findOne({ type: "newsletter" });
        if (result) {
            return res.status(200).json(result);
        } else {
            res.status(404).json({ error: "No newsletter found for the given department." });
        }
    } catch (error) {
        console.error("Error fetching newsletter:", error);
        await logError(req, error, 'Error fetching newsletter details', 500);
        res.status(500).json({ error: "Error fetching newsletter" });
    }
}


async function getDeptActivities1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        // Fetch document with type: activities
        const departmentData = await collection.findOne({ type: "activities" });

        if (!departmentData) {
            return res.status(404).json({ message: "Department activities not found" });
        }

        // Sort activities if exists
        const sortedActivities = Array.isArray(departmentData.dept_activities)
            ? departmentData.dept_activities.sort((a, b) => new Date(b.date) - new Date(a.date))
            : [];

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


async function getStuActivities1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        // Fetch document with type student_achievements
        const result = await collection.findOne({ type: "student_achievements" });

        if (result) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({ error: "No student achievements found for the given department." });
        }
    } catch (error) {
        console.error("Error fetching student activities:", error);
        await logError(req, error, 'Error fetching student activities details', 500);
        res.status(500).json({ error: "Error fetching student activities" });
    }
}


async function getInfrastructure1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        // Fetch document with type infrastructure
        const result = await collection.findOne({ type: "infrastructure" });

        if (result) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({ error: "No infrastructure details found for the given department." });
        }
    } catch (error) {
        console.error("Error fetching infrastructure details:", error);
        await logError(req, error, 'Error fetching infrastructure details', 500);
        res.status(500).json({ error: "Error fetching infrastructure details" });
    }
}

async function getMou1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        // Fetch document with type mous
        const departmentData = await collection.findOne({ type: "mous" });

        if (!departmentData) {
            return res.status(404).json({ message: "MOUs not found for this department." });
        }

        return res.status(200).json(departmentData);
    } catch (error) {
        console.error("Error fetching MOUs:", error);
        await logError(req, error, 'Error fetching MOUs details', 500);
        res.status(500).json({ error: "Error fetching MOUs" });
    }
}

async function getDepartmentResearch1(req, res) {
    const deptId = req.params.deptId;
    const collectionName = deptMap[deptId];

    if (!collectionName) {
        return res.status(400).json({ error: "Invalid department ID" });
    }

    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        // Fetch document with type research
        const departmentResearch = await collection.findOne({ type: "research" });

        if (!departmentResearch) {
            return res.status(404).json({ message: `No research data found for department ID: ${deptId}` });
        }

        return res.status(200).json(departmentResearch);
    } catch (error) {
        console.error('Error fetching department research data:', error);
        await logError(req, error, 'Error fetching department research data', 500);
        res.status(500).json({ error: 'Error fetching department research data' });
    }
}

async function getsidebar (req, res) {
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
    getVisionMission1,
    getHODDetails1,
    getStaffDetails1,
    getSyllabus1,
    getNewsLetters1,
    getDeptActivities1,
    getStuActivities1,
    getInfrastructure1,
    getMou1,
    getDepartmentResearch1,
    getsidebar
}