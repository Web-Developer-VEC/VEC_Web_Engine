const { getDb } = require('../config/db');
const nodemailer = require("nodemailer");
const logError = require('../middlewares/logerror');

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
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GRIEVANCE_BASE_EMAIL,
                pass: process.env.GRIEVANCE_EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.GRIEVANCE_BASE_EMAIL,
            to: process.env.GRIEVANCE_TARGET_EMAIL,
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
        await logError(req, error, 'Error in Grievance', 500);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getHelpDesk (req, res) {
    console.log("AJith")
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ message: 'Type is required in request body' });
    }

    const db = getDb();
    const collection = db.collection('help_desk');

    // Find by type
    const result = await collection.findOne({ type: type });

    if (!result) {
      return res.status(404).json({ message: 'No record found for the given type' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching data by type:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}


module.exports = { getGrievance ,getHelpDesk};