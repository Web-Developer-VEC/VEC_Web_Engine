const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');
const {
  ALLOWED_NCC_ARMY_TYPES,
  ALLOWED_NCC_NAVY_TYPES,
  ALLOWED_NSS_TYPES,
  ALLOWED_YRC_TYPES
} = require('../models/allowed_types');

async function getArmyData(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_NCC_ARMY_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid IQAC section` });
    }

    const db = getDb();
    const collection = db.collection('ncc_army');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching ncc army section:', error);
    await logError(req, error, 'Error fetching ncc army section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getNavyData(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_NCC_NAVY_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid IQAC section` });
    }

    const db = getDb();
    const collection = db.collection('ncc_navy');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching ncc navy section:', error);
    await logError(req, error, 'Error fetching ncc navy section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getNssData(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_NSS_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid IQAC section` });
    }

    const db = getDb();
    const collection = db.collection('nss');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching nss section:', error);
    await logError(req, error, 'Error fetching nss section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getYrcData(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_YRC_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid IQAC section` });
    }

    const db = getDb();
    const collection = db.collection('yrc');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching yrc section:', error);
    await logError(req, error, 'Error fetching yrc section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { 
    getArmyData,
    getNavyData,
    getNssData,
    getYrcData
 }