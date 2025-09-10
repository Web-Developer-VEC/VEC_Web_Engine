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
        const content = categoryExists.content;

        if (Array.isArray(content) && typeof content[0] === "string") {
          // Array of primitives → merge unique
          const newItems = Array.isArray(meta_data?.content)
            ? meta_data.content
            : [meta_data];

          const merged = [...new Set([...content, ...newItems])];

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $set: { "data.$.content": merged } }
          );
        } else if (Array.isArray(content) && content[0]?.title) {
          // Array of objects → add unique by title
          const newItems = Array.isArray(meta_data?.content)
            ? meta_data.content
            : Array.isArray(meta_data)
            ? meta_data
            : [meta_data]; // wrap single object

          newItems.forEach((newItem) => {
            if (!content.some((item) => item.title === newItem.title)) {
              content.push(newItem);
            }
          });

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $set: { "data.$.content": content } }
          );
        } else {
          // Single object → overwrite
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            {
              $set: {
                "data.$.content": Array.isArray(meta_data)
                  ? meta_data
                  : [meta_data],
              },
            }
          );
        }
      } else {
        // Create new category
        await mainCollection.updateOne(
          { type: collection_type },
          {
            $push: {
              data: {
                category,
                content: Array.isArray(meta_data) ? meta_data : [meta_data],
              },
            },
          },
          { upsert: true }
        );
      }

      return {
        message: `Insert successful for ${collection_type} - category ${category}`,
        data: meta_data,
      };
    }

    // 6️⃣ Unknown type fallback
    throw new Error("Unknown collection_type");
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error; // ❌ Let handleTempAction manage error response
  }
}

module.exports = { insertData };
