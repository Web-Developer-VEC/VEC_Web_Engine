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
        success: true,
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

        const metaArray = Array.isArray(meta_data?.content)
          ? meta_data.content
          : Array.isArray(meta_data)
            ? meta_data
            : [meta_data];

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $set: { "data.$.content": metaArray } }
        );
      }

      // Case B: Array of objects
      // Case B: Array of objects
      // Case C: Single object → overwrite
      // Case B: Array of objects
      else if (Array.isArray(content) && typeof content[0] === "object") {

        const uniqueKeys = {
          membership_details: "member_details",
          Collection: "title",
          library_services: "title",
          library_resources: "title",
        };

        const key = uniqueKeys[collection_type];

        if (!key) {
          throw new Error(`No unique key configured for '${collection_type}'`);
        }

        const updates = Array.isArray(meta_data.content)
          ? meta_data.content
          : [meta_data];

        const updateMap = new Map(
          updates.map(item => [item[key], item])
        );

        const updatedContent = content.map(item => {
          const updated = updateMap.get(item[key]);

          return updated
            ? {
              ...item,
              ...updated
            }
            : item;
        });

        await mainCollection.updateOne(
          {
            type: collection_type,
            "data.category": category,
          },
          {
            $set: {
              "data.$.content": updatedContent,
            },
          }
        );
      }
      else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].content": meta_data } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      return {
        success: true,
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
        const isMatch = Object.keys(original_data).every(
          (key) => item.hasOwnProperty(key) && item[key] === original_data[key]
        );

        if (isMatch) {
          return {
            ...item,
            ...meta_data,
            ...(meta_data.hasOwnProperty("image_path") && {
              image_path: meta_data.image_path,
            }),
          };
        }

        return item;
      });

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      return {
        success: true,
        message: `Updated successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 7️⃣ No matching case found
    throw new Error("No matching case found");
  } catch (error) {
    console.error("Error updating data:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { updateData };
