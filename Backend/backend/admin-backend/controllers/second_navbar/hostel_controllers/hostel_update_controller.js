async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data, category } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("Type, newData and originalData required");
    }

    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Type not found");

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      // let updatedData = Array.isArray(doc.data) ? [...doc.data] : [doc.data];

      // updatedData = updatedData.map((item) => {
      //   let newItem = { ...item };

      //   Object.keys(meta_data).forEach((key) => {
      //     if (newItem.hasOwnProperty(key)) {
      //       if (Array.isArray(newItem[key])) {
      //         newItem[key] = newItem[key].map((val) =>
      //           val === original_data[key] ? meta_data[key] : val
      //         );
      //         if (!newItem[key].includes(meta_data[key])) {
      //           newItem[key].push(meta_data[key]);
      //         }
      //       } else {
      //         if (newItem[key] === original_data[key]) {
      //           newItem[key] = meta_data[key];
      //         }
      //       }
      //     } else {
      //       newItem[key] = Array.isArray(meta_data[key])
      //         ? meta_data[key]
      //         : [meta_data[key]];
      //     }
      //   });

      //   return newItem;
      // });

      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: [meta_data] } }
      );

      return { success: true, message: "About data updated successfully", meta_data };
    }

    // ---------- HOSTEL FACILITIES ----------
    if (collection_type === "hostel_facilities") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k])
      );

      if (index === -1) throw new Error("Facility not found");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "hostel_facilities" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Hostel facility updated successfully" };
    }

    // ---------- WARDEN ----------
    if (collection_type === "warden") {
      if (!category) throw new Error("Category required for warden");

      const catIndex = doc.data.findIndex((c) => c.category === category);
      if (catIndex === -1) throw new Error("Category not found");

      const memberIndex = doc.data[catIndex].members.findIndex((m) =>
        Object.keys(original_data).every((k) => m[k] === original_data[k])
      );
      console.log("Priyan",doc.data[catIndex]);
      console.log("Pr",original_data);
      
      if (memberIndex === -1) throw new Error("Member not found");

      doc.data[catIndex].members[memberIndex] = {
        ...doc.data[catIndex].members[memberIndex],
        ...meta_data,
      };

      await mainCollection.updateOne(
        { type: "warden" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Warden updated successfully" };
    }
// ---------- GENERAL INFO ----------
if (collection_type === "general_info") {
  if (!category) {
    throw new Error("Category required for general_info");
  }

  const catIndex = doc.data.findIndex(
    (c) => c.category === category
  );

  if (catIndex === -1) {
    throw new Error(`Category not found: ${category}`);
  }

  /* ===================== MENU ===================== */
  if (category === "Menu") {
    const menuContainer = doc.data[catIndex].content?.[0]?.hostel_menu?.[0];
    if (!menuContainer) {
      throw new Error("Menu structure not found");
    }

    Object.keys(meta_data).forEach((key) => {
      if (!menuContainer[key]) return;

      // Replace only matched value
      if (original_data?.[key]) {
        const idx = menuContainer[key].findIndex(
          (v) => v === original_data[key]
        );
        if (idx !== -1) {
          menuContainer[key][idx] = meta_data[key];
        }
      }
    });

    await mainCollection.updateOne(
      { type: "general_info" },
      { $set: { data: doc.data } }
    );

    return {
      success: true,
      message: "General info (Menu) updated successfully",
    };
  }

  /* ===================== TIMINGS / OTHERS ===================== */
  if (!original_data?.section) {
    throw new Error("Section is required to update general_info content");
  }

  const contentIndex = doc.data[catIndex].content.findIndex(
    (item) => item.section === original_data.section
  );

  if (contentIndex === -1) {
    throw new Error(
      `Content not found for section: ${original_data.section}`
    );
  }

  // 🔹 Merge only updated fields (eg: dinner)
  doc.data[catIndex].content[contentIndex] = {
    ...doc.data[catIndex].content[contentIndex],
    ...meta_data,
  };

  await mainCollection.updateOne(
    { type: "general_info" },
    { $set: { data: doc.data } }
  );

  return {
    success: true,
    message: `General info (${category}) updated successfully`,
  };
}
    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

module.exports = { updateData };
