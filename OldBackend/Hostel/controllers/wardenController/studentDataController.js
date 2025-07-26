const { getDb } = require('../../config/db');

async function getStudentData(req, res) {
    let clientInstance;
    try {
        const warden_unique_id = req.session.unique_number;
        const db = getDb();
        const wardenCollection = db.collection("warden_database");
        const studentCollection = db.collection("student_database");
        const passCollection = db.collection("pass_details");

        const warden = await wardenCollection.findOne({ unique_id: warden_unique_id });

        if (!warden) {
            return res.status(404).json({ error: "Warden not found" });
        }
        if (!warden.primary_year) {
            return res.status(400).json({ error: "Warden primary year not found" });
        }

        const student_data = await studentCollection.find({
            year: { $in: warden.primary_year },
            gender: warden.gender
        }).toArray();

        if (student_data.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        const students_with_pass_data = await Promise.all(student_data.map(async (student) => {
            let pass_info = {
                from: null,
                to: null,
                passtype: null
            };

            if (student.transit_status === true) {
                const pass_data = await passCollection.findOne({
                    registration_number: student.registration_number,
                    request_completed: false
                });

                if (pass_data) {
                    pass_info = {
                        from: pass_data.from,
                        to: pass_data.to,
                        passtype: pass_data.passtype
                    };
                }
            }

            return {
                ...student,
                pass_info
            };
        }));

        res.json({ students: students_with_pass_data });

    } catch (err) {
        console.error("❌ Error fetching student details:", err);
        res.status(500).json({ error: "Server error" });
    } finally {
        if (clientInstance) {
            await clientInstance.close();
        }
    }
}

async function markStudentVacate (req, res) {
    try {
        const db = getDb();
        const studentCollection = db.collection("student_database");

        const { student_id } = req.body;
        if (!student_id) {
            return res.status(400).json({ error: "Missing student_id" });
        }

        const updateResult = await studentCollection.updateOne(
            { registration_number : student_id },
            { $set: { vacate_status: true } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "Student marked for vacating successfully" });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function foodChangeDirect (req, res) {
    const { registration_number } = req.body;

    if (!registration_number) {
        return res.status(400).json({ error: "Registration number is required" });
    }

    try {
        const db = getDb();
        const studentCollection = db.collection("student_database"); 

        const student = await studentCollection.findOne({ registration_number });

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        const newFoodType = student.foodtype === "Veg" ? "Non-Veg" : "Veg";
        await studentCollection.updateOne(
            { registration_number },
            { $set: { foodtype: newFoodType } }
        );

        res.json({ message: `Food type updated to ${newFoodType}`, foodtype: newFoodType });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function roomnoChangeDirect(req, res) {
    try {
        const { student_id, new_room_number } = req.body;
        if (!student_id || !new_room_number) {
            return res.status(400).json({ error: "Missing student_id or new_room_number" });
        }

        const db = getDb();
        const studentCollection = db.collection("student_database");

        const updateResult = await studentCollection.updateOne(
            { registration_number: student_id },
            { $set: { room_number: new_room_number } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.status(200).json({ message: "Room number updated successfully" });
    } catch (error) {
        console.error("Error Editing Room Number:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getStudentData,
    foodChangeDirect,
    roomnoChangeDirect,
    markStudentVacate
}