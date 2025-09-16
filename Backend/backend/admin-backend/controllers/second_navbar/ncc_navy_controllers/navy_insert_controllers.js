async function insertData( tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    // 1️⃣ Validate required fields
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    // 2️⃣ Define type categories
    const singleDocTypes = ["about"];
    const multiDocTypes = ["events","awards"];
    const categoryBasedTypes = [
      "team"
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

    // 3️⃣ Category-based → insert or merge
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category)
        throw new Error("category is required");

      const doc = await mainCollection.findOne({ type: collection_type });
      const categoryExists = doc?.data?.find((c) => c.category === category);

      if (categoryExists) {
        const content = categoryExists.members;

         if (Array.isArray(content) && content[0]?.name) {
          // Array of objects → add unique by name
          const newItems = Array.isArray(meta_data?.content)
            ? meta_data.content
            : Array.isArray(meta_data)
            ? meta_data
            : [meta_data]; // wrap single object

          newItems.forEach((newItem) => {
            if (!content.some((item) => item.name === newItem.name)) {
              content.push(newItem);
            }
          });
        console.log("dinesh");
        
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $push: { "data.$.members": meta_data } }
          );
        } else {
          // Single object → overwrite
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            {
              $set: {
                "data.$.members": Array.isArray(meta_data)
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
                members: Array.isArray(meta_data) ? meta_data : [meta_data],
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
    throw new Error("Internal server error");
  }
}

module.exports = { insertData };
