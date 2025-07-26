const { getDb } = require('../../config/db');

async function getStudentDetailsSuperior (req, res) {
    try {
        const db = getDb();
        const studentsCollection = db.collection("student_database");
        const passCollection = db.collection("pass_details");

        let student_data = await studentsCollection.find({}).toArray();

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
        students_with_pass_data.sort((a, b) => {
            if (b.year !== a.year) {
                return b.year - a.year;
            }
            return a.gender === "Male" ? -1 : 1;
        });
        res.status(200).json({ students: students_with_pass_data });

    } catch (error) {
        console.error("❌ Error fetching student details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function incrementBatchYear (req, res) {
    try {
        const { batch } = req.body;
        if (!batch) {
            return res.status(400).json({ error: "Missing batch" });
        }

        const db = getDb();
        const studentCollection = db.collection("student_database");

        const students = await studentCollection.find({ batch: batch, year: { $lt: 4 } }).toArray();

        if (students.length === 0) {
            return res.status(404).json({ error: "No eligible students found in this batch" });
        }
        await studentCollection.updateMany(
            { batch: batch, year: { $lt: 4 } },
            { $inc: { year: 1 } }
        );

        res.status(200).json({ 
            message: "Student years incremented successfully", 
            updated_students: students.length 
        });

    } catch (error) {
        console.error("❌ Error Incrementing Student Year:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function updateStudentSuperior (req, res) {
    try {
        const db = getDb();
        const studentCollection = db.collection("student_database");

        const { registration_number, ...updateFields } = req.body;

        if (!registration_number) {
            return res.status(400).json({ error: "Registration number is required" });
        }
        const restrictedFields = ["registration_number", "password", "_id"];
        restrictedFields.forEach(field => delete updateFields[field]);

        const updateResult = await studentCollection.updateOne(
            { registration_number: registration_number },
            { $set: updateFields }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.status(200).json({
            message: "Student details updated successfully",
            registration_number: registration_number,
            updated_fields: updateFields
        });

    } catch (error) {
        console.error("❌ Error updating student details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getStudentDetailsSuperior,
    updateStudentSuperior,
    incrementBatchYear
}