const { getlogDb } = require("../../config/db");
const logError = require("../../middlewares/logerror");

const allowedDepts = [
    "AIDS",
    "AUTO",
    "CHEMISTRY",
    "CIVIL",
    "CSE",
    "CSECS",
    "EEE",
    "EIE",
    "ECE",
    "ENGLISH",
    "IT",
    "MATHS",
    "MECH",
    "TAMIL",
    "PHYSICS",
    "MECSE",
    "MBA",
];

const Appraisal = async (req, res, next) => {
    try {
        const db = getlogDb();
        const data = req.processedData;

        const dept = data.department.toLowerCase();
        const year = data.academic_year;
        if (!allowedDepts.includes(dept.toUpperCase())) {
            return res.status(400).json({
                message: "Invalid department"
            });
        }

        const collectionName = `${dept}_appraisals`;
 
        // 🔥 CHECK IF COLLECTION EXISTS
        const collections = await db.listCollections(
            { name: collectionName }
        ).toArray();

        if (collections.length === 0) {
            console.log("Creating collection:", collectionName);
            await db.createCollection(collectionName);

            // Create index immediately
            await db.collection(collectionName).createIndex(
                { academic_year: 1 },
                { unique: true }
            );
        }

        const collection = db.collection(collectionName);

        delete data.department;

        await collection.updateOne(
            { academic_year: year },
            {
                $set: {
                    ...data,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        res.status(200).json({
            message: "Appraisal saved successfully"
        });

    } catch (error) {
        console.error("Error saving appraisal:", error);
        await logError(req, error, "Error saving appraisal", 500);
        return res.status(500).json({ error: "Internal server error" });
    }
};
const getAppraisal = async (req, res, next) => {
    try {
        const db = getlogDb();

        const { department, academic_year } = req.body;

        if (!department || !academic_year) {
            return res.status(400).json({
                message: "Department and Academic Year required"
            });
        }

        if (!allowedDepts.includes(department)) {
            return res.status(400).json({
                message: "Invalid department"
            });
        }

        const collectionName = `${department}_appraisals`;

        // 🔥 Ensure academic_year is array
        const years = Array.isArray(academic_year)
            ? academic_year
            : [academic_year];

        const documents = await db.collection(collectionName).find({
            academic_year: { $in: years }
        }).toArray();

        if (!documents.length) {
            return res.status(404).json({
                message: "No data found"
            });
        }

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        console.error("Error fetching appraisal:", error);
        await logError(req, error, "Error fetching appraisal", 500);
        return res.status(500).json({ error: "Internal server error" });
    }
};
module.exports = { getAppraisal, Appraisal };
