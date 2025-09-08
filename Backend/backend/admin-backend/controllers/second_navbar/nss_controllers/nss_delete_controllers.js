
// // ------------------- DELETE -------------------
async function deleteData(req, res, tempDoc, mainCollection) {
  try {
    let { collection_type, meta_data, category } = tempDoc;

     meta_data = JSON.parse(meta_data);

    if (!collection_type || !meta_data)
      return res.status(400).json({ error: "Type and data required" });

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) return res.status(404).json({ error: "Type not found" });

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      let updatedData = Array.isArray(doc.data) ? [...doc.data] : [doc.data]; // normalize to array

      updatedData = updatedData.map((item) => {
        let newItem = { ...item };

        if (meta_data) {
          Object.keys(meta_data).forEach((key) => {
            if (newItem.hasOwnProperty(key)) {
              if (Array.isArray(newItem[key])) {
                // remove matching values
                newItem[key] = newItem[key].filter(
                  (val) => val !== meta_data[key]
                );

                // if array becomes empty → remove the key
                if (newItem[key].length === 0) {
                  delete newItem[key];
                }
              } else {
                // remove field if value matches
                if (newItem[key] === meta_data[key]) {
                  delete newItem[key];
                }
              }
            }
          });
        }

        return newItem;
      });

      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: updatedData } }
      );

      const freshDoc = await mainCollection.findOne({ type: "about" });
      return res.json({
        message: "About data deleted successfully",
        data: freshDoc.data,
      });
    }

    //newsupdates for nss and yrc

    if (collection_type === "news_updates") {
      if (!meta_data) {
        return res.status(400).json({ error: "deleteData required" });
      }

      const updatedData = doc.data.filter((item) => item !== meta_data);

      await mainCollection.updateOne(
        { type: "news_updates" },
        { $set: { data: updatedData } }
      );

      return res.json({
        message: "News update deleted successfully",
        data: updatedData,
      });
    }

    // ---------- AWARDS / EVENTS ----------
    if (["awards", "events"].includes(collection_type)) {
      doc.data = doc.data.filter(
        (item) => !Object.keys(meta_data).every((k) => item[k] === meta_data[k])
      );
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: doc.data } }
      );
      return res.json({ message: `Delete successful for ${collection_type}` });
    }

    // ---------- TEAM ----------
    if (collection_type === "team") {
      if (!category)
        return res.status(400).json({ error: "Category required for team" });
      const catIndex = doc.data.findIndex((c) => c.category === category);
      if (catIndex === -1)
        return res.status(404).json({ error: "Category not found" });
      doc.data[catIndex].members = doc.data[catIndex].members.filter(
        (m) => !Object.keys(meta_data).every((k) => m[k] === meta_data[k])
      );
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: doc.data } }
      );
      return res.json({ message: "Delete successful for Team" });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}


module.exports = { deleteData };    