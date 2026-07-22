async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    // 1️⃣ Validate required fields
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    // 2️⃣ Define type categories
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

    // 3️⃣ Single document type → overwrite
    if (singleDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: [meta_data] } },
        { upsert: true }
      );
      return {
        success: true, 
        message: `Overwritten successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 4️⃣ Multi-document type → append
    if (multiDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $push: { data: meta_data } },
        { upsert: true }
      );
      return {
        success: true, 
        message: `Inserted successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 5️⃣ Category-based → insert or merge
if (categoryBasedTypes.includes(collection_type)) {
  if (!category) throw new Error("category is required");

  const doc = await mainCollection.findOne({ type: collection_type });
  const categoryExists = doc?.data?.find((c) => c.category === category);

  if (categoryExists) {
    const content = categoryExists.content || [];

    // Primitive array (strings)
    if (Array.isArray(content) && typeof content[0] === "string") {
      const newItems = Array.isArray(meta_data.content)
        ? meta_data.content
        : [meta_data];

      const merged = [...new Set([...content, ...newItems])];

      await mainCollection.updateOne(
        { type: collection_type, "data.category": category },
        {
          $set: {
            "data.$.content": merged,
          },
        }
      );
    }

    // Object array
    else if (Array.isArray(content) && typeof content[0] === "object") {
      // unique field for every collection
      const uniqueKeys = {
        membership_details: "member_details",
        Collection: "title",
        library_services: "title",
        library_resources: "title",
      };

      const uniqueKey = uniqueKeys[collection_type];

      const existing = [...content];

      const newItems = Array.isArray(meta_data.content)
        ? meta_data.content
        : [meta_data];

      if (uniqueKey) {
        newItems.forEach((newItem) => {
          const exists = existing.some(
            (item) => item[uniqueKey] === newItem[uniqueKey]
          );

          if (!exists) {
            existing.push(newItem);
          }
        });
      } else {
        existing.push(...newItems);
      }

      await mainCollection.updateOne(
        { type: collection_type, "data.category": category },
        {
          $set: {
            "data.$.content": existing,
          },
        }
      );
    }

    // Empty content
    else {
      await mainCollection.updateOne(
        { type: collection_type, "data.category": category },
        {
          $set: {
            "data.$.content": meta_data.content || [],
          },
        }
      );
    }
  } else {
    // Category doesn't exist
    await mainCollection.updateOne(
      { type: collection_type },
      {
        $push: {
          data: {
            category,
            content: meta_data.content || [],
          },
        },
      },
      { upsert: true }
    );
  }

  return {
    success: true,
    message: `Insert successful for ${collection_type} - ${category}`,
    data: meta_data,
  };
}
    // 6️⃣ Unknown type fallback
    throw new Error("Unknown collection_type");
  } catch (error) {
    console.error("Error inserting data:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { insertData };
