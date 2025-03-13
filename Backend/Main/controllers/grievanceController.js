const { getDb } = require('../config/db');
const nodemailer = require("nodemailer");

async function getGrievance (req, res)  {
    try {
        const db = getDb();
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
}

module.exports = { getGrievance }