async function updatedData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, original_data, meta_data } = tempDoc;

    if (!collection_type || !original_data || !meta_data) {
      throw new Error("Missing required fields");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document not found");

    const multipleObjectTypes = ["exam_curriculum"];
    const categoryBasedTypes = ["COE", "regulation", "all_forms", "rankholder"];

    /* ---------------- MULTI OBJECT TYPES ---------------- */
    if (multipleObjectTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type, data: original_data },
        { $set: { "data.$": meta_data } }
      );

      return { success: true, message: "Updated successfully" };
    }

    /* ---------------- CATEGORY BASED TYPES ---------------- */
    if (!categoryBasedTypes.includes(collection_type)) {
      throw new Error("Unsupported collection_type");
    }

    if (!category) throw new Error("Missing category");

    const categoryExists = doc.data.find(
      (item) => item.category === category
    );
    if (!categoryExists) throw new Error("Category not found");

    const field =
      collection_type === "COE"
        ? "members"
        : collection_type === "regulation"
          ? "links"
          : "content";
    

    let updatedArray = [...categoryExists[field]];

    if (collection_type === "regulation") {
      original_data.links.forEach((oldItem, index) => {
        const newItem = meta_data.links[index];

        const itemIndex = updatedArray.findIndex((item) =>
          Object.keys(oldItem).every((key) => item[key] === oldItem[key])
        );

        if (itemIndex !== -1) {
          updatedArray[itemIndex] = {
            ...updatedArray[itemIndex],
            ...newItem
          };
        }
      });
    } else {
      updatedArray = categoryExists[field].map((item) =>
        Object.keys(original_data).every(
          (key) => item[key] === original_data[key]
        )
          ? { ...item, ...meta_data }
          : item
      );
    }
    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { [`data.$[elem].${field}`]: updatedArray } },
      { arrayFilters: [{ "elem.category": category }] }
    );

    return { success: true, message: "Updated successfully" };

  } catch (error) {
    throw new Error(`Update failed: ${error.message}`);
  }
}

module.exports = { updatedData };
