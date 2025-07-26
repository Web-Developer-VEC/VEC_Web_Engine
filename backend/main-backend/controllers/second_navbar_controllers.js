const { getDb } = require('../config/db');
const nodemailer = require("nodemailer");
const logError = require('../middlewares/logerror');

async function getNirf (req, res) {
    const db = getDb();
    const collection = db.collection('nirf');
    try {
        const NIRFData = await collection.find({}).toArray();
        if (NIRFData.length === 0) {
            return res.status(404).json({ message: 'No NIRF data found' });
        }
        res.status(200).json(NIRFData);
    } catch (error) {
        console.error('Error fetching NIRF data:', error);
        await logError(req, error, 'Error in nirf data', 500);
        res.status(500).json({ error: 'Error fetching NIRF data' });
    }
}

async function getNaac (req, res) {
    const db = getDb();
    const collection = db.collection('naac');
    try {
        const NAACData = await collection.find({}).toArray();
        if (NAACData.length === 0) {
            return res.status(404).json({ message: 'No NAAC data found' });
        }
        res.status(200).json(NAACData);
    } catch (error) {
        console.error('Error fetching NAAC data:', error);
        await logError(req, error, 'Error in naac data', 500);
        res.status(500).json({ error: 'Error fetching NAAC data' });
    }
}

async function getNba (req, res) {
    const db = getDb();
    const collection = db.collection('nba');

    try {
        const nba = await collection.find({}).toArray();
        if (nba.length === 0) {
            return res.status(404).json({ message: 'No nba data found' });
        }
        res.status(200).json(nba);
    } catch (error) {
        console.error('Error fetching alumni data:', error);
        await logError(req, error, 'Error in nba data', 500);
        res.status(500).json({ error: 'Error fetching nba data' });
    }
}

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

async function getIqac(req, res) {
    try {
        const db = getDb();
        const collection = db.collection("IQAC");

        const data = await collection.find({}).toArray();

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }

        res.status(200).json({ data: data });
    } catch (error) {
        console.error("Error fetching data:", error);
        await logError(req, error, 'Error in IQAC data', 500);
        return res.status(500).json({ error: "Internal server error" });
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
    getNaac,
    getNba,
    getNirf,
    getiic,
    getIqac,
    getECell,
    iicApplyForm
}