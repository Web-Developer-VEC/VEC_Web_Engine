const { getDb } = require("../config/db");
const logError = require("../middlewares/logerror");

function Middleware(allowedtypes,collectionname) {
  return async function (req, res, next) {
    try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }
    if (!allowedtypes.has(type)) {
      return res.status(400).json({ error:` "${type}" is not a valid admissions section `});//
    }
    const db = getDb();
    const collection = db.collection(collectionname);

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message:` Section '${type}' not found` });
    }

    return res.status(200).json(document);
    next();

  } catch (error) {
    console.error(`Error fetching '${collectionname}' section:`, error);
    await logError(req, error,`Error fetching '${collectionname}' section`, 500);
    return res.status(500).json({ error:' Internal Server Error' });
  }
}
}

module.exports = Middleware;