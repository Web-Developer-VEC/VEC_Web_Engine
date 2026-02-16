async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category, original_data } = tempDoc;

    if (!collection_type || !meta_data) {
      return { success: false, error: "collection_type and meta_data are required" };
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) return { success: false, error: "Document not found" };
    if (!doc.data) return { success: false, error: "Document has no data field" };

    console.log("🔎 Incoming update request:", {
      collection_type,
      category,
      original_data,
      meta_data,
    });

    // 1️⃣ Single-doc types → introduction, vision
  const singleDocTypes = ["introduction", "vision"];

if (singleDocTypes.includes(collection_type)) {
  const allValues = Array.isArray(meta_data)
    ? meta_data
    : meta_data && typeof meta_data === "object"
    ? Object.values(meta_data)
    : [meta_data];

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: allValues } }
  );

  return {
    success: true,
    message: `Updated successfully for ${collection_type}`,
    data: allValues,
  };
}
    // 2️⃣ Multi-doc types → faculty, infra, intramural, hod
    const multiDocTypes = ["faculty", "infrastructure", "intramural", "hod"];
    if (multiDocTypes.includes(collection_type)) {
      if (!original_data) {
        return { success: false, error: "original_data is required for multi-doc updates" };
      }

      const updatedData = doc.data.map((item) =>
        JSON.stringify(item) === JSON.stringify(original_data)
          ? { ...item, ...meta_data }
          : item
      );

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      return { success: true, message: `Updated successfully for ${collection_type}`, data: meta_data };
    }

    // 3️⃣ Category-based: achievements
    const categoryBasedTypes = ["achivements"];
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) return { success: false, error: "category is required" };

      const categoryExists = doc.data.find((c) => c.category === category);
      if (!categoryExists) return { success: false, error: `Category ${category} not found` };

  if (category === "coordinator") {
  const categoryIndex = doc.data.findIndex((c) => c.category === category);
  if (categoryIndex === -1) return { success: false, error: `Category ${category} not found` };

  let content = doc.data[categoryIndex].content;

  // Ensure content is an array
  if (content && !Array.isArray(content)) {
    content = [content];
  }

  // Find the content object by original year & zone
  const contentIndex = content.findIndex(
    (c) => c.zone === original_data.zone && c.year === original_data.year
  );

  if (contentIndex === -1) {
    // If not found, add as a new object
    await mainCollection.updateOne(
      { type: collection_type, "data.category": category },
      { $push: { "data.$.content": meta_data } }
    );
    return { success: true, message: "New content added", data: meta_data };
  }

  // Update the content object fields including year, zone, and image_path
  const oldPaths = Array.isArray(original_data.image_path) ? original_data.image_path : [original_data.image_path];
  const newPaths = Array.isArray(meta_data.image_path) ? meta_data.image_path : [meta_data.image_path];

  const updatedContent = {
    ...content[contentIndex],
    ...meta_data,
    image_path: content[contentIndex].image_path.map(img => {
      const index = oldPaths.indexOf(img);
      return index !== -1 ? newPaths[index] : img;
    })
  };


  // Update in MongoDB
  await mainCollection.updateOne(
  {
    type: collection_type,
    "data.category": category
  },
  {
    $set: {
      "data.$.content": updatedContent
    }
  }
);


  return { success: true, message: "Content updated successfully", data: updatedContent };
}
    const content = categoryExists.content;

      // Case A: Array of strings
      if (Array.isArray(content) && typeof content[0] === "string") {
        if (!original_data) return { success: false, error: "original_data required" };

        const originalArray = Array.isArray(original_data) ? original_data : [original_data];
        const metaArray = Array.isArray(meta_data) ? meta_data : [meta_data];

        const updated = content.map((item) =>
          originalArray.includes(item) ? metaArray[originalArray.indexOf(item)] || item : item
        );

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $set: { "data.$.content": updated } }
        );
      }

      // Case B: Array of objects
      else if (Array.isArray(content)) {
        if (!original_data) return { success: false, error: "original_data required" };

        const isEqual = (obj1, obj2) => Object.keys(obj1).every((key) => obj2[key] === obj1[key]);

        const updatedContent = content.map((item) =>
          isEqual(item, original_data) ? { ...item, ...meta_data } : item
        );

        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].content": updatedContent } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      // Case C: Single object
      else if (content && typeof content === "object") {
        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].content": { ...content, ...meta_data } } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      return { success: true, message: `Updated successfully in ${collection_type} - category ${category}`, data: meta_data };
    }

    // 4️⃣ Action plans
  const singleCategoryTypes = ["action_plan"];

if (singleCategoryTypes.includes(collection_type)) {
  if (!meta_data) return { success: false, error: "meta_data is required" };

  const docExists = doc.data?.[0];
  if (!docExists) return { success: false, error: "No data found for action_plan" };

  const updateDatas = Array.isArray(meta_data) ? meta_data : [meta_data]

  await mainCollection.updateOne(
    {type : collection_type},
    {$set : { data : updateDatas}}
  )


  return {
    success: true,
    message: `Updated successfully in ${collection_type}`,
    data: meta_data
  };
}
    // 5️⃣ No case matched
    return { success: false, error: "No matching case found" };
  } catch (err) {
    console.error("❌ Error updating data:", err);
    return { success: false, error: "Internal server error", details: err.message };
  }
}

module.exports = { updateData };
