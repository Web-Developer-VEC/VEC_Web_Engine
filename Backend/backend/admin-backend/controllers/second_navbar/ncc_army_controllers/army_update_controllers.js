
// ------------------- UPDATE -------------------
async function updateData(req, res, tempDoc, mainCollection) {
  try {
    // Extract file paths
    let { collection_type, meta_data, original_data, category } = tempDoc;

    meta_data = JSON.parse(meta_data);
    original_data=JSON.parse(original_data);

    if (!collection_type || !meta_data || !original_data)
      return res
        .status(400)
        .json({ error: "Type and newData and originaldata required" });
    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) return res.status(404).json({ error: "Type not found" });

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      let updatedData = Array.isArray(doc.data) ? [...doc.data] : [doc.data]; // normalize to array

      updatedData = updatedData.map((item) => {
        let newItem = { ...item };

        Object.keys(meta_data).forEach((key) => {
          if (newItem.hasOwnProperty(key)) {
            if (Array.isArray(newItem[key])) {
              // 🔄 Replace matching old value with new value
              newItem[key] = newItem[key].map((val) =>
                val === original_data[key] ? meta_data[key] : val
              );

              // optional: if old value not found, add it
              if (!newItem[key].includes(meta_data[key])) {
                newItem[key].push(meta_data[key]);
              }
            } else {
              // if it's a string, just overwrite directly
              if (newItem[key] === original_data[key]) {
                newItem[key] = meta_data[key];
              }
            }
          } else {
            // if key doesn't exist, add it fresh
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
      if (!existingData || !newData) {
        return res
          .status(400)
          .json({ error: "existingData and newData required" });
      }

      const updatedData = doc.data.map((item) =>
        item === original_data ? meta_data : item
      );

      await mainCollection.updateOne(
        { type: "news_updates" },
        { $set: { data: updatedData } }
      );

      return res.json({
        message: "News update modified successfully",
        data: updatedData,
      });
    }

    // ---------- AWARDS / EVENTS ----------
    if (["awards", "events"].includes(collection_type)) {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k])
      );
      if (index === -1)
        return res.status(404).json({ error: "Matching object not found" });
      doc.data[index] = { ...doc.data[index], ...meta_data };
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: doc.data } }
      );
      return res.json({ message: `Update successful for ${collection_type}` });
    }

    // ---------- TEAM ----------
    if (collection_type === "team") {
      if (!category)
        return res.status(400).json({ error: "Category required for team" });
      const catIndex = doc.data.findIndex((c) => c.category === category);
      if (catIndex === -1)
        return res.status(404).json({ error: "Category not found" });
      const memberIndex = doc.data[catIndex].members.findIndex((m) =>
        Object.keys(original_data).every((k) => m[k] === original_data[k])
      );
      if (memberIndex === -1)
        return res.status(404).json({ error: "Member not found" });
      doc.data[catIndex].members[memberIndex] = {
        ...doc.data[catIndex].members[memberIndex],
        ...meta_data,
      };
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: doc.data } }
      );
      return res.json({ message: "Update successful for Team" });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

module.exports = { updateData };    