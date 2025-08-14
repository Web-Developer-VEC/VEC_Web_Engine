const { getDb } = require('../config/db');
const nodemailer = require("nodemailer");
const logError = require('../middlewares/logerror');
// const {ALLOWED_IIC_TYPES}=require('../models/iic_models') ;

async function iicApplyForm (req, res) {
    try {
        const db = getDb();
        const inccellappCollection = db.collection("inccellapp_data");
        const {name,phno,email,content,original_captcha, entered_captcha} = req.body;

        const inccellapp_data = {
            name,
            phno,
            email,
            content,
            submitted_at: new Date()
        };
        await inccellappCollection.insertOne(inccellapp_data);
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.BASE_EMAIL,
                pass: process.env.BASE_EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.BASE_EMAIL,
            to: process.env.ICELL_TARGET_EMAIL,
            subject: "New Incubation Cell Application Submitted",
            html: `
              <div style="max-width:600px;margin:0 auto;padding:24px;background:#fff;border:1px solid #e0e0e0;font-family:'Segoe UI',Arial,sans-serif;color:#222;">
                <h2 style="font-weight:700;margin-bottom:16px;border-bottom:1px solid #e0e0e0;padding-bottom:8px;">Incubation Cell Application Received</h2>
                <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Name:</span> ${name}</p>
                <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Email:</span> ${email}</p>
                <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Contact Number:</span> ${phno}</p>
                <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Captcha:</span> ${original_captcha}</p>
                <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Re-entered Captcha:</span> ${entered_captcha}</p>
                <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Message:</span><br>${content}</p>
                <p style="font-size:15px;margin-top:24px;">Please address this application as soon as possible.</p>
              </div>
            `
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Incubation Cell Application Data submitted successfully and email notification sent" });

    } catch (error) {
        console.error("Error:", error);
        await logError(req, error, 'Error in inccellapp_data data', 500);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports = {iicApplyForm}