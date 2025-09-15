async function updatedData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error(
        "Missing required fields: collection_type, category, original_data or meta_data"
      );
    }

    const doc = await mainCollection.findOne({ type: collection_type });

    const singleDocTypes = [
      "about_vec",
      "about_trust",
      "vision_and_mission",
      "Management",
      "contact_us",
    ];

    const categoryBasedtypes = ["AISHE"];

    if (!doc) {
      throw new Error(`Document with type ${collection_type} not found`);
    }
    if (singleDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: meta_data } }
      );
      return { message: `Updated data in ${collection_type}` };
    } else if (categoryBasedtypes.includes(collection_type)) {
      if (!category) {
        throw new Error("Category is required for this collection type");
      }
      const categoryExists = doc.data.find((c) => c.category === category);
      if (!categoryExists)
        throw new Error(`Category ${category} not found`);
    if (categoryExists) {

        const content = categoryExists.content;

      const isEqual = (obj1, obj2) =>
          Object.keys(obj1).every((key) => obj2[key] === obj1[key]);

        const updatedArray = (Array.isArray(content) ? content : []
        ).map((item) =>
          isEqual(item, original_data) ? { ...item, ...meta_data } : item
        );
        const upd = Array.isArray(updatedArray) ? updatedArray : updatedArray;
        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].content": upd } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      } else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $addToSet: { data: { category, content: meta_data } } }
        );
        return {
          message: `update data into existing category ${category} in ${collection_type}`,
        };
      }
    }
  } catch (error) {
    throw new Error(`Error updating data: ${error.message}`);
  }
}

module.exports = { updatedData };
