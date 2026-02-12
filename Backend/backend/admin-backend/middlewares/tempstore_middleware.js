const { getAdminDb, getDb } = require("../../main-backend/config/db");

module.exports = async function storeTempMiddleware(req, res, next) {
  try {
    const db = getAdminDb();
    const maindb = getDb();
    const docs = req.docsFromBusboy || [];

    if (!docs || docs.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No documents provided" });
    }

    const adminMeta = {
      id: req.session.admin.id,
      name: req.session.admin.name,
      role: req.session.admin.role,
    };

    // Prepare documents for DB
    const tempDocs = await Promise.all(
      docs.map(async (doc) => {
        const {
          collectionName,
          collection_type,
          action,
          title,
          category,
          meta_data,
          original_data,
        } = doc;


        if (!collectionName || !collection_type || !action || !title) {
          throw new Error(
            "collectionName, collection_type, action, and title are required"
          );
        }

        // Deep equality (compares nested arrays & objects by value)
function deepEqual(a, b) {
  if (a === b) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((el, i) => deepEqual(el, b[i]));
  }

  if (typeof a === "object" && typeof b === "object" && a && b) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(k => deepEqual(a[k], b[k]));
  }

  return false;
}

// Recursively search inside objects/arrays
function findMatchingItem(container, original, excludeKey) {
  if (!container) return null;

  // If it's an array, check each element
  if (Array.isArray(container)) {
    for (const el of container) {
      const found = findMatchingItem(el, original, excludeKey);
      if (found) return found;
    }
    return null;
  }

  // If it's an object
  if (typeof container === "object") {
    // Match check (ignoring excluded key)
    const matches = Object.keys(original)
      .filter(k => k !== excludeKey)
      .every(k => deepEqual(container[k], original[k]));

    if (matches) return container;

    // Otherwise search nested props
    for (const key in container) {
      if (Array.isArray(container[key]) || typeof container[key] === "object") {
        const found = findMatchingItem(container[key], original, excludeKey);
        if (found) return found;
      }
    }
  }

  return null;
}


        // ✅ Use all uploaded files (no docIndex filter)
        const allFiles = req.uploadedFiles || [];

        const skipPdfFor = ["AISHE","ug","mba","placement_details", "nirf", "nba","regulation","all_forms","COE"];

        const skipImageFor = ["members","library_services","team","achivements"];

        const mainCollection = maindb.collection(collectionName);

        const existingDoc = await mainCollection.findOne(
          { type: collection_type },
          { projection: { data: 1 } }
        );
   

        let pdf_path = !skipPdfFor.includes(collection_type)
          ? allFiles
              .filter((f) => f.mimetype === "application/pdf")
              .map((f) => f.location || `/${f.key}`)
          : [];


        let image_path = !skipImageFor.includes(collection_type)
          ? allFiles
              .filter((f) => f.mimetype?.startsWith("image/"))
              .map((f) => f.location || `/${f.key}`)
          : [];

        // console.log("📂 Docs from busboy:", docs);
        // console.log("📂 Uploaded files (S3):", req.uploadedFiles);
        // console.log("pdf path ", pdf_path);
        // console.log("image path ", image_path);
          
        console.log(existingDoc)

        const notdoc = Array.isArray(existingDoc.data)?existingDoc.data:[existingDoc.data];

        if(action === "update"){
          
          if(pdf_path.length>0){
               

            for (const item of notdoc) {
              const matches = findMatchingItem(item, original_data, "pdf_path");
              // const matches = Object.keys(original_data).filter(k=>k!=="pdf_path").every(
              //   k=> item[k] === original_data[k]
              // );

              console.log("Hari",original_data.pdf_path); 
              console.log("Dinesh",item.pdf_path)
              console.log("Ajith",matches)
              
              if (matches) {
                
                pdf_path = Array.isArray(item.pdf_path)
                  ? pdf_path
                  : pdf_path[0];
                break;
              }
            }
          }else if (image_path.length>0){
            for (const item of notdoc) {

              const matches = findMatchingItem(item, original_data, "image_path");
              // const matches = Object.keys(original_data).filter(k=>k!=="image_path").every(
              //   k=> item[k] === original_data[k]
               
              // );
               console.log("Main",item, "Original",original_data)

              if (matches) {
                image_path = Array.isArray(item.image_path)
                  ? image_path
                  : image_path[0];
                break;
              }
            }
          }
        }
        if(action === "insert"){
          if(pdf_path.length>0){
            for (const item of notdoc) {
                pdf_path = Array.isArray(item.pdf_path)
                  ? pdf_path
                  :pdf_path[0];
                  
                break;
            }
          }else if(image_path.length>0){
            for (const item of notdoc) {
                image_path = Array.isArray(item.image_path)
                  ? image_path
                  : image_path[0];
                break;
            }
          }
        }

        return {
          collection: collectionName,
          collection_type,
          action,
          title,
          category: category || null,
          meta_data: {
            ...(meta_data || {}), // keep other frontend meta
            ...(image_path.length ? { image_path } : {}),
            ...(pdf_path.length ? { pdf_path } : {}),
          },
          original_data: original_data || null,
          admin: adminMeta,
          status: "pending",
          createdAt: new Date(),
        };
      })
    );

    // Group by collection and insert
    const groupedByCollection = tempDocs.reduce((acc, doc) => {
      if (!acc[doc.collection]) acc[doc.collection] = [];
      acc[doc.collection].push(doc);
      return acc;
    }, {});

    let totalInserted = 0;
    const insertedResults = {};

    for (const [collectionName, groupDocs] of Object.entries(
      groupedByCollection
    )) {
      const tempCollection = db.collection(collectionName);
      if (groupDocs.length === 1) {
        const result = await tempCollection.insertOne(groupDocs[0]);
        totalInserted += 1;
        insertedResults[collectionName] = [result.insertedId];
      } else {
        const result = await tempCollection.insertMany(groupDocs);
        totalInserted += groupDocs.length;
        insertedResults[collectionName] = Object.values(result.insertedIds);
      }
    }

    return res.json({
      success: true,
      message: `Stored ${totalInserted} request(s) across ${
        Object.keys(groupedByCollection).length
      } collection(s) for admin approval`,
      insertedCount: totalInserted,
      insertedIds: insertedResults,
    });
  } catch (err) {
    console.error("❌ TempStore Error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Server error", details: err.message });
  }
};

