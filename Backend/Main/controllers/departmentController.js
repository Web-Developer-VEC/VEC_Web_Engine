const { getDb } = require('../config/db');

// Fetch Vision & Mission
async function getVisionMission(req, res) {
    const departmentId = req.params.deptId;
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
        res.status(500).json({ error: "Error fetching student activities" });
    }
}

// Fetch Support Staff Details  (innu varala)
async function getSupportStaff(req, res) {
    const deptId = req.params.deptId;
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
            Departments: deptId       //remove the VEC array for new push
        });

        if (!departmentData) {
            return res.status(404).json({ message: "Department not found" });  //for the new push directly return the departmentData
        }
        
        return res.status(200).json(departmentData);
    } catch (error) {
        console.error("❌ Error fetching MOUs:", error);
        res.status(500).json({ error: "Error fetching MOUs" });
    }
}


// Fetch Research Data  (innu varala)
async function getRDyear(req, res) {
    const { deptId, year } = req.params;

    if (!deptId || !year) {
        return res.status(400).json({ error: 'Both dept_id and year are required' });
    }

    const db = getDb();
    const collection = db.collection('research_data');

    try {
        // Fetch the document for the department
        const result = await collection.findOne({ dept_id: deptId });

        if (!result || !result.data || !result.data.data) {
            return res.status(404).json({ message: 'No research data found for the given department' });
        }
        
        const yearData = result.data.data.find(entry => entry.year === year);

        if (!yearData) {
            return res.status(404).json({ message: 'No research data found for the given year' });
        }

        res.status(200).json(yearData);
    } catch (error) {
        console.error("❌ Error fetching research data:", error);
        res.status(500).json({ error: "Error fetching research data" });
    }
}

async function getRD(req, res) {
    const { deptId } = req.params;

    if (!deptId) {
        return res.status(400).json({ error: 'Both dept_id required' });
    }

    const db = getDb();
    const collection = db.collection('research_data');

    try {
        // Fetch the document for the department
        const result = await collection.findOne({ dept_id: deptId });

        if (!result || !result.data || !result.data.data) {
            return res.status(404).json({ message: 'No research data found for the given department' });
        }
        res.status(200).json(result);
        
        // const yearData = result.data.data.find(entry => entry.year === year);

        // if (!yearData) {
        //     return res.status(404).json({ message: 'No research data found for the given year' });
        // }

    } catch (error) {
        console.error("❌ Error fetching research data:", error);
        res.status(500).json({ error: "Error fetching research data" });
    }
}

async function getslidebar (req, res) {
    const db = getDb();
    const collection = db.collection('sidebar');
    const deptid = req.params.deptId;

    try {
        // Find the document that matches the given deptid
        const departmentData = await collection.findOne({ deptId: deptid });

        // Check if the department exists
        if (!departmentData) {
            return res.status(404).json({ message: `No data found for deptId: ${deptid}` });
        }

        // Send the matched department data
        res.status(200).json(departmentData);
    } catch (error) {
        console.error('❌ Error fetching department data:', error);
        res.status(500).json({ error: 'Error fetching department data' });
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
    getRDyear,
    getRD,
    getslidebar
};
