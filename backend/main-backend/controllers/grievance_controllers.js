const { getDb } = require('../config/db');
const nodemailer = require("nodemailer");

async function getGrievance (req, res)  {
    try {
        const db = getDb();
        const grevienceCollection = db.collection("grevience_database");
        const { name , email , contact_number , query_about, category , original_captcha , entered_captcha ,  content } = req.body;
        const originalCaptchaStr = String(original_captcha);
        if (!name || !contact_number || !query_about || !category || !originalCaptchaStr || !entered_captcha || !email || !content) {
           console.error("Missing required fields");
           return res.status(400).json({ error: "All fields are required" });
        }

        if (originalCaptchaStr !== String(entered_captcha)) {
           return res.status(400).json({ error: "Captcha does not match" });
        }
        const grevienceData = {
            name,
            email,
            contact_number,
            query_about,
            category,
            content,
            submitted_at: new Date().toISOString()
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
            subject: `New Grievance Submitted: ${category}`,
            text:
            `A new grievance has been submitted with the following details:

            Name: ${name}
            Email: ${email}
            Contact Number: ${contact_number}
            Query About: ${query_about}
            Category: ${category}

            Message:
            ${content}

            Please review and address this grievance as soon as possible.`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Grievance submitted successfully and email notification sent" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getGrievance }