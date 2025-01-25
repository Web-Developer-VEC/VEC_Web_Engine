const { getDb } = require('../config/db');

// Fetch Vision & Mission
async function getVisionMission(req, res) {
    const departmentId = parseInt(req.params.deptId);
    const db = getDb();
    const collection = db.collection('vision_and_mission');

    try {
        const result = await collection.findOne({ department_id: departmentId });
        if (result) {
            return res.json(result);
        } else {
            res.status(404).json({ error: "Department not found" });
        }
    } catch (error) {
        console.error("❌ Error fetching department data:", error);
        res.status(500).json({ error: "Error fetching data" });
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
        console.error("❌ Error fetching HOD details:", error);
        res.status(500).json({ error: "Error fetching HOD details" });
    }
}

// Fetch Staff Details
async function getStaffDetails(req, res) {
    const deptId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('staff_details');

    try {
        const staffDetails = await collection.find(
            { unique_id: { $regex: `^VEC-${deptId}-` } }, 
            {
                projection: {
                    Name: 1,
                    Designation: 1,
                    Photo: 1,
                    "Google Scholar Profile": 1,
                    "Research Gate": 1,
                    "Orchid Profile": 1,
                    "Publon Profile": 1,
                    "Scopus Author Profile": 1,
                    "LinkedIn Profile": 1,
                    unique_id:1,
                    _id: 0, 
                }
            }
        ).toArray();

        if (staffDetails.length > 0) {
            return res.status(200).json(staffDetails);
        } else {
            res.status(404).json({ message: 'No staff found for the given department ID.' });
        }
    } catch (error) {
        console.error("❌ Error fetching staff details:", error);
        res.status(500).json({ error: "Error fetching staff details" });
    }
}

// Fetch Curriculum 
async function getSyllabus(req, res) {
    const departmentId = req.params.deptId;
    const db = getDb();
    const collection = db.collection('curriculum');

    try {
        const departmentData = await collection.findOne({ dept_id: departmentId });
        if (!departmentData) {
            return res.status(404).json({ message: "Department not found" });
        }
        return res.status(200).json(departmentData);

    } catch (error) {
        console.error("❌ Error fetching curriculum data:", error);
        res.status(500).json({ error: "Error fetching curriculum data" });
    }
}

// Fetch Infrastructure
async function getInfrastructure(req, res) {
    const deptId = parseInt(req.params.deptId);
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

        return res.status(200).json(sortedActivities);

    } catch (error) {
        console.error("❌ Error fetching department activities:", error);
        res.status(500).json({ error: "Error fetching department activities" });
    }
}

// Fetch Student Activities
async function getStuActivities(req, res) {
    const deptId = parseInt(req.params.deptId);
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
        res.status(500).json({ error: "Error fetching student activities" });
    }
}

// Fetch Support Staff Details  (innu varala)
async function getSupportStaff(req, res) {
    const deptId = parseInt(req.params.deptId);
    const db = getDb();
    const collection = db.collection('support_staffs');

    try {
        const result = await collection.findOne({
            "supporting_staff.Unique_id": { $regex: `^VEC-${deptId}-` }
        });

        if (result && result.supporting_staff.length > 0) {
            const filteredStaff = result.supporting_staff.filter(staff =>
                staff.Unique_id.startsWith(`VEC-${deptId}-`)
            );
            return res.status(200).json(filteredStaff);
        } else {
            res.status(404).json({ message: 'No support staff found for the given department ID.' });
        }
    } catch (error) {
        console.error("❌ Error fetching support staff details:", error);
        res.status(500).json({ error: "Error fetching support staff details" });
    }
}

// Fetch  MOUs Details 
async function getMou(req, res) {
    const { deptId } = req.params;
    const db = getDb();
    const collection = db.collection('MOUs');

    try {
        const departmentData = await collection.findOne({
            "VEC.Departments": deptId
        });

        if (!departmentData) {
            return res.status(404).json({ message: "Department not found" });
        }
        
        const department = departmentData.VEC.find(dept => dept.Departments === deptId);
        
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }
        return res.status(200).json(department);
    } catch (error) {
        console.error("❌ Error fetching MOUs:", error);
        res.status(500).json({ error: "Error fetching MOUs" });
    }
}


// Fetch Research Data  (innu varala)
async function getRD(req, res) {
    const { deptId, year } = req.params;

    if (!deptId || !year) {
        return res.status(400).json({ error: 'Both dept_id and year are required' });
    }

    const db = getDb();
    const collection = db.collection('research_data');

    try {
        const result = await collection.find({
            deptId: deptId,
            "data.data.year": year
        }).toArray();

        if (result.length === 0) {
            return res.status(404).json({ message: 'No research data found for the given department and year' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error fetching research data:", error);
        res.status(500).json({ error: "Error fetching research data" });
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
    getSupportStaff,
    getMou,
    getRD
};
