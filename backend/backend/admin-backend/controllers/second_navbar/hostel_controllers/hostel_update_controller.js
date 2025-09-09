// ------------------- UPDATE -------------------

async function updateData(req, res, tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data, category } = tempDoc;

    if (!collection_type || !meta_data || !original_data)
      return res
        .status(400)
        .json({ error: "Type, newData and originalData required" });

    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) return res.status(404).json({ error: "Type not found" });

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      let updatedData = Array.isArray(doc.data) ? [...doc.data] : [doc.data];

      updatedData = updatedData.map((item) => {
        let newItem = { ...item };

        Object.keys(meta_data).forEach((key) => {
          if (newItem.hasOwnProperty(key)) {
            if (Array.isArray(newItem[key])) {
              newItem[key] = newItem[key].map((val) =>
                val === original_data[key] ? meta_data[key] : val
              );
              if (!newItem[key].includes(meta_data[key])) {
                newItem[key].push(meta_data[key]);
              }
            } else {
              if (newItem[key] === original_data[key]) {
                newItem[key] = meta_data[key];
              }
            }
          } else {
            newItem[key] = Array.isArray(meta_data[key])
              ? meta_data[key]
              : [meta_data[key]];
          }
        });

        return newItem;
      });

      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: updatedData } }
      );

      return res.json({
        message: "About data updated successfully",
        data: updatedData,
      });
    }

    // ---------- HOSTEL FACILITIES ----------
    if (collection_type === "hostel_facilities") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k])
      );

      if (index === -1)
        return res.status(404).json({ error: "Facility not found" });

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "hostel_facilities" },
        { $set: { data: doc.data } }
      );

      return res.json({ message: "Hostel facility updated successfully" });
    }

    // ---------- WARDEN ----------
    if (collection_type === "warden") {
      if (!category)
        return res.status(400).json({ error: "Category required for warden" });

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
        { type: "warden" },
        { $set: { data: doc.data } }
      );

      return res.json({ message: "Warden updated successfully" });
    }

    // ---------- GENERAL INFO ----------
if (collection_type === "general_info") {
  if (!category)
    return res
      .status(400)
      .json({ error: "Category required for general_info" });

  const catIndex = doc.data.findIndex((c) => c.category === category);
  if (catIndex === -1)
    return res.status(404).json({ error: "Category not found" });

  // ✅ Special handling for Menu
  if (category === "Menu") {
    // Example: update by replacing specific items in arrays
    // We assume `original_data` contains the old value that should be updated

    const menu = doc.data[catIndex].content[0].hostel_menu[0];

    // Loop over keys (day, Breakfast, lunch, snacks, dinner)
    ["day", "Breakfast", "lunch", "snacks", "dinner"].forEach((key) => {
      if (meta_data[key]) {
        const arr = menu[key];

        // Find index of the original value inside the array
        const idx = arr.findIndex((val) => val === original_data[key]);

        if (idx !== -1) {
          // Replace with new value
          arr[idx] = meta_data[key];
        } else {
          // If original not found, optionally push (to mimic insert behavior)
          arr.push(meta_data[key]);
        }
      }
    });

    // Save back to DB
    await mainCollection.updateOne(
      { type: "general_info" },
      { $set: { data: doc.data } }
    );

    return res.json({ message: "General info (Menu) updated successfully" });
  }

  // ✅ Default handling for Timings (or other categories)
  const contentIndex = doc.data[catIndex].content.findIndex((c) =>
    Object.keys(original_data).every((k) => c[k] === original_data[k])
  );
  if (contentIndex === -1)
    return res.status(404).json({ error: "Content not found" });

  doc.data[catIndex].content[contentIndex] = {
    ...doc.data[catIndex].content[contentIndex],
    ...meta_data,
  };

  await mainCollection.updateOne(
    { type: "general_info" },
    { $set: { data: doc.data } }
  );

  return res.json({ message: "General info (Timings) updated successfully" });
}
  }
   catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

module.exports = { updateData };