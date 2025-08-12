const { getDb } = require('../config/db');
const nodemailer = require("nodemailer");
const logError = require('../middlewares/logerror');
const {
ALLOWED_IQAC_TYPES ,
ALLOWED_ACCREDITATION_TYPES ,
ALLOWED_IIC_TYPES ,
ALLOWED_INCUBATION_TYPES , 
ALLOWED_ECELL_TYPES ,
ALLOWED_TRANSPORT_TYPES , 
ALLOWED_OTHER_FACILITIES_TYPES}=require('../models/second_navbar_models') ;

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

async function getIicSection(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_IIC_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid IIC section` });
    }

    const db = getDb();
    const collection = db.collection('iic');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching IIC section:', error);
    await logError(req, error, 'Error fetching IIC section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getIncubationSection(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_INCUBATION_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid Incubation section` });
    }

    const db = getDb();
    const collection = db.collection('incubation');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching Incubation section:', error);
    await logError(req, error, 'Error fetching Incubation section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getTransportSection(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_TRANSPORT_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid Incubation section` });
    }

    const db = getDb();
    const collection = db.collection('transport');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching transport section:', error);
    await logError(req, error, 'Error fetching transport section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getOtherFacilitiesSection(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_OTHER_FACILITIES_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid Incubation section` });
    }

    const db = getDb();
    const collection = db.collection('other_facilities');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching other facilities section:', error);
    await logError(req, error, 'Error fetching other facilities section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getECellSection(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_ECELL_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid Incubation section` });
    }

    const db = getDb();
    const collection = db.collection('ecell');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching ecell section:', error);
    await logError(req, error, 'Error fetching ecell section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function iicApplyForm (req, res) {
    try {
        const db = getDb();
        const inccellappCollection = db.collection("inccellapp_data");
        const {name,phno,email,content,original_captcha, entered_captcha} = req.body;

        console.log(name,phno,email,content);
        
       


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
    getIicSection,
    getIqacSection,
    getECellSection,
    iicApplyForm,
    getAccreditationSection,
    getIncubationSection,
    getTransportSection,
    getOtherFacilitiesSection
}