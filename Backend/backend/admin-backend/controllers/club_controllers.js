
// ------------------- INSERT -------------------
async function insertData(req, res, tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data)
      return res.status(400).json({ error: "Type and newData required" });
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
      return res.json({ message: `Insert successful for ${type}` });
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

// ------------------- UPDATE -------------------

async function updateData(req, res, tempDoc, mainCollection) {
  try {
    // Extract file paths
    const { collection_type, meta_data, original_data, category } = tempDoc;

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


// // ------------------- DELETE -------------------
async function deleteData(req, res, tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

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

// ------------------- ROUTE HANDLER -------------------
async function handleTempAction(req, res) {
  try {

    const tempDoc = req.tempDoc; // ✅ from handleTempApproval
    const mainCollection = req.mainCollection;

    if (tempDoc.status !== "approved") {
      return res.status(400).json({ error: "Action not approved yet" });
    }

    switch (tempDoc.action) {
      case "insert":
        await insertData(req, res, tempDoc, mainCollection);
        break;
      case "update":
        await updateData(req, res, tempDoc, mainCollection);
        break;
      case "delete":
        await deleteData(req, res, tempDoc, mainCollection);
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    // ✅ send success response once
    // return res.json({ message: `Action '${tempDoc.action}' executed successfully` });s
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });

  }
}

module.exports = { handleTempAction };
