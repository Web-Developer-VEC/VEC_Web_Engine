async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category, original_data } = tempDoc;

    // 1️⃣ Validate required fields
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    // 2️⃣ Fetch the document for this collection_type
    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document not found");
    if (!doc.data) throw new Error("Document has no data field");

    // Debug
    console.log("🔎 Incoming update request:", {
      collection_type,
      category,
      original_data,
      meta_data,
    });

    // 3️⃣ Define type categories
    const singleDocTypes = ["about_the_library", "books", "journal", "HOD"];
    const multiDocTypes = [
      "Faculty_Staff",
      "advisors",
      "Ebook_Sources",
      "digital_libraries",
    ];
    const categoryBasedTypes = [
      "membership_details",
      "Collection",
      "library_services",
      "library_resources",
    ];

    // 4️⃣ Single-doc types → overwrite entire data array
    if (singleDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: [meta_data] } }
      );
      return {
        message: `Updated successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 5️⃣ Category-based
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) throw new Error("category is required");

      const categoryExists = doc.data.find((c) => c.category === category);
      if (!categoryExists) throw new Error(`Category ${category} not found`);

      const content = categoryExists.content;

      // Case A: Array of strings
      if (Array.isArray(content) && typeof content[0] === "string") {
        if (!original_data) throw new Error("original_data required");

        // Unwrap { content: [...] } if present
        const originalArray = Array.isArray(original_data?.content)
          ? original_data.content
          : Array.isArray(original_data)
          ? original_data
          : [original_data];

        const metaArray = Array.isArray(meta_data?.content)
          ? meta_data.content
          : Array.isArray(meta_data)
          ? meta_data
          : [meta_data];

        // const updated = content.map((item) =>
        //   originalArray.includes(item)
        //     ? metaArray[originalArray.indexOf(item)] || item
        //     : item
        // );

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $set: { "data.$.content": metaArray } }
        );
      }

      // Case B: Array of objects → match by title
      else if (Array.isArray(content) && content[0]?.title) {
        if (!original_data) throw new Error("original_data required");

        const originalArray = Array.isArray(original_data)
          ? original_data
          : [original_data];
        const metaArray = Array.isArray(meta_data) ? meta_data : [meta_data];

        const updated = content.map((item) => {
          const index = originalArray.findIndex(
            (od) => od.title === item.title
          );
          return index !== -1 ? { ...item, ...metaArray[index] } : item;
        });

        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].content": updated } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      // Case C: Single object → overwrite
      else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].content": meta_data } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      return {
        message: `Updated successfully in ${collection_type} - category ${category}`,
        data: meta_data,
      };
    }

    // 6️⃣ Multi-document types → array of objects without category
    if (multiDocTypes.includes(collection_type)) {
      if (!original_data) {
        throw new Error("original_data is required for multi-doc updates");
      }

      const updatedData = doc.data.map((item) => {
      const isMatch =
      item.name === original_data.name &&
      item.educational_qualification === original_data.educational_qualification &&
      item.designation === original_data.designation;

      if (isMatch) {
      return {
        ...item,
        ...meta_data,          // update fields
        image_path: meta_data.image_path || item.image_path
      };
      }

      return item;
      });

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      return {
        message: `Updated successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 7️⃣ No matching case found
    throw new Error("No matching case found");
  } catch (error) {
    console.error("Error updating data:", error);
    throw error; // ❌ Pass error up to handleTempAction
  }
}

module.exports = { updateData };
