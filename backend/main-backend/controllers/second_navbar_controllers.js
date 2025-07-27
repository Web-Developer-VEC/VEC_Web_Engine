const { getDb } = require('../config/db');
const nodemailer = require("nodemailer");
const logError = require('../middlewares/logerror');

const ALLOWED_IQAC_TYPES = [
  'objectives',
  'coordinator',
  'members',
  'minutes_of_meetings',
  'academic_admin_audit',
  'gallery',
  'strategic_plan',
  'best_practices',
  'institutional_distinctiveness',
  'code_of_ethics',
  'aqar',
  'iso_certificate'
];

const ALLOWED_ACCREDITATION_TYPES = [
  'naac',
  'nba',
  'qs_rating',
  'nirf'
];

async function getiic(req, res) {
    const db = getDb();
    const collection = db.collection('iic');
    
    try {
        
        const data = await collection.findOne({}); 

        if (!data) {
            return res.status(404).json({ message: "No data found" });
        }

        return res.status(200).json(data); 
    } catch (error) {
        console.error("Error fetching data:", error);
        await logError(req, error, 'Error in iic data', 500);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getIqacSection(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_IQAC_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid IQAC section` });
    }

    const db = getDb();
    const collection = db.collection('iqac');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching IQAC section:', error);
    await logError(req, error, 'Error fetching IQAC section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAccreditationSection(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_ACCREDITATION_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid accreditation/ranking section` });
    }

    const db = getDb();
    const collection = db.collection('accreditations_and_ranking');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching accreditation section:', error);
    await logError(req, error, 'Error fetching accreditation section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getECell (req, res) {
    const db = getDb();
    const collection = db.collection('e_cell');

    try {
        const e_cell = await collection.find({}).toArray();
        if (e_cell.length === 0) {
            return res.status(404).json({ message: 'No E-cell list found' });
        }
        res.status(200).json(e_cell);
    } catch (error) {
        console.error('Error fetching e-cell list:', error);
        await logError(req, error, 'Error in e cell data', 500);
        res.status(500).json({ error: 'Error fetching e_cell list' });
    }
}

async function iicApplyForm (req, res) {
    try {
        const db = getDb();
        const inccellappCollection = db.collection("inccellapp_data");
        const {name,phno,email,content} = req.body;

        console.log(name,phno,email,content);
        
       

        if (!name || !phno || !email || !content) {
            return res.status(400).json({ error: "All fields are required" });
        }
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
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.BASE_EMAIL,
            to: process.env.ICELL_TARGET_EMAIL,
            subject: `New Incubation Cell Application Submitted`,
            text: `You have received a new application from ${email}.
            \n\n
            Name: ${name}
            Email: ${email}
            Contact Number: ${phno} \n\n

            Message:\n${content}\n\nPlease address it as soon as possible.`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Incubation Cell Application Data submitted successfully and email notification sent" });

    } catch (error) {
        console.error("Error:", error);
        await logError(req, error, 'Error in inccellapp_data data', 500);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getiic,
    getIqacSection,
    getECell,
    iicApplyForm,
    getIqacSection,
    getAccreditationSection
}