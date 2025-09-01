async function insertData(req, res, tempDoc, mainCollection) {
  try {
    const { collection_type, category, filePaths } = tempDoc;

    if (!collection_type || !category || !filePaths) {
      return res.status(400).json({ error: "collection_type, category, and filePaths are required" });
    }

    // 🔹 In mainCollection, field name is "type"
    const existingDoc = await mainCollection.findOne({ type: collection_type });

    if (!existingDoc) {
      // Create new document with type + category + images
      await mainCollection.insertOne({
        type: collection_type,
        data: [{
          category,
          image_path: Array.isArray(filePaths) ? filePaths : [filePaths]
        }]
      });
      return res.json({ message: "New type and category created successfully" });
    }

    // 🔹 Find category inside existing data
    const categoryIndex = existingDoc.data.findIndex(c => c.category === category);

    if (categoryIndex === -1) {
      // New category inside same type
      existingDoc.data.push({
        category,
        image_path: Array.isArray(filePaths) ? filePaths : [filePaths]
      });
    } else {
      // Append new images without duplicates
      const existingImages = existingDoc.data[categoryIndex].image_path || [];
      const newImages = Array.isArray(filePaths) ? filePaths : [filePaths];
      existingDoc.data[categoryIndex].image_path = Array.from(new Set([...existingImages, ...newImages]));
    }

    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { data: existingDoc.data } }
    );

    res.json({ message: "Image(s) inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function deleteData(req, res, tempDoc, mainCollection) {
  try {
    const { collection_type, category, filePaths } = tempDoc;

    if (!collection_type || !category || !filePaths) {
      return res.status(400).json({ error: "collection_type, category, and filePaths are required" });
    }

    const existingDoc = await mainCollection.findOne({ type: collection_type });
    if (!existingDoc) return res.status(404).json({ error: "Type not found" });

    const categoryIndex = existingDoc.data.findIndex(c => c.category === category);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Remove selected images
    const removeImages = Array.isArray(filePaths) ? filePaths : [filePaths];
    existingDoc.data[categoryIndex].image_path =
      (existingDoc.data[categoryIndex].image_path || []).filter(img => !removeImages.includes(img));

    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { data: existingDoc.data } }
    );

    res.json({ message: "Image(s) deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function handleTempAction(req, res) {
  try {
    const tempDoc = req.tempDoc;              // ✅ from handleTempApproval
    const mainCollection = req.mainCollection; 
    console.log(tempDoc.status)

    if (tempDoc.status !== "approved") {
      return res.status(400).json({ error: "Action not approved yet" });
    }

    switch (tempDoc.action) {
      case "insert":
        await insertData(req, res, tempDoc, mainCollection);
        break;
      case "delete":
        await deleteData(req, res, tempDoc, mainCollection);
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    // ✅ send success response once
    return res.json({ message: `Action '${tempDoc.action}' executed successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}

module.exports= {handleTempAction};


