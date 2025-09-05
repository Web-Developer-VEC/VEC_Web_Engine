
// ------------------- INSERT -------------------
async function insertData(req, res, tempDoc, mainCollection) {
  try {
    let { collection_type, meta_data, category } = tempDoc;

    meta_data = JSON.parse(meta_data);

    if (!collection_type || !meta_data)
      return res.status(400).json({ error: "Type and metadata required" });
    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    let doc = await mainCollection.findOne({ type: collection_type });

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      let updatedData = Array.isArray(doc.data) ? [...doc.data] : [doc.data]; // normalize to array

      // loop through each object in the array
      updatedData = updatedData.map((item) => {
        let newItem = { ...item };
        Object.keys(meta_data).forEach((key) => {
          if (newItem.hasOwnProperty(key)) {
            if (Array.isArray(newItem[key])) {
              // merge arrays
              newItem[key] = [
                ...new Set([
                  ...newItem[key],
                  ...(Array.isArray(meta_data[key])
                    ? meta_data[key]
                    : [meta_data[key]]),
                ]),
              ];
            } else {
              // convert string → array and append
              newItem[key] = [
                ...new Set([
                  newItem[key],
                  ...(Array.isArray(meta_data[key])
                    ? meta_data[key]
                    : [meta_data[key]]),
                ]),
              ];
            }
          } else {
            // if key doesn't exist, add it
            newItem[key] = Array.isArray(meta_data[key])
              ? meta_data[key]
              : [meta_data[key]];
          }
        });
        return newItem;
      });

      // persist changes in MongoDB
      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: updatedData } }
      );

      return res.json({
        message: "About data updated successfully",
        data: updatedData,
      });
    }

    //newsupdate for nss and yrc

    if (collection_type === "news_updates") {
      if (!meta_data) {
        return res.status(400).json({ error: "newData is required" });
      }

      const updatedData = [...doc.data, meta_data]; // append string

      await mainCollection.updateOne(
        { type: "news_updates" },
        { $set: { data: updatedData } }
      );

      return res.json({
        message: "News update inserted successfully",
        data: updatedData,
      });
    }
    // ---------- AWARDS / EVENTS ----------
    if (["awards", "events"].includes(collection_type)) {
      if (!doc) {
        await mainCollection.insertOne({
          type: collection_type,
          data: [meta_data],
        });
      } else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $push: { data: meta_data } }
        );
      }
      return res.json({ message: `Insert successful for ${collection_type}` });
    }

    // ---------- TEAM ----------
    if (collection_type === "team") {
      if (!category)
        return res.status(400).json({ error: "Category required for team" });

      if (doc) {
        // Check if category exists
        const categoryExists = doc.data.find((c) => c.category === category);

        if (categoryExists) {
          // Push new member to existing category
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $push: { "data.$.members": meta_data } }
          );
        } else {
          // Add new category with members
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: { category, members: [meta_data] } } }
          );
        }
      } else {
        // No team doc yet, create fresh
        await mainCollection.insertOne({
          type: collection_type,
          data: [{ category, members: [meta_data] }],
        });
      }

      return res.json({ message: "Insert successful for Team" });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

module.exports = { insertData };