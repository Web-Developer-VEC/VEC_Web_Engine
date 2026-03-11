async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }
  if (collection_type !== "activities") {
    throw new Error("Incorrect collection type or route");
  }

  if (collection_type === "activities") {
    const doc = await mainCollection.findOne({ type: collection_type });

    const categoryExist = doc?.data.find((c) => c.category === category);

    if (categoryExist) {
      const yearExist = categoryExist.content.find(
        (e) => e.year === meta_data.year
      );

      // find the array field name dynamically (excluding year)
      const arrayField = Object.keys(meta_data).find(
        (key) => key !== "year"
      );

      if (yearExist && arrayField) {
        await mainCollection.updateOne(
          { type: collection_type },
          {
            $push: {
              [`data.$[d].content.$[c].${arrayField}`]: {
                $each: meta_data[arrayField],
              },
            },
          },
          {
            arrayFilters: [
              { "d.category": category },
              { "c.year": meta_data.year },
            ],
          }
        );

        return {success:true,  message: `The insertion is successfully done for ${category}` };
      } else {
        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $push: { "data.$.content": meta_data } }
        );

        return {success:true, message: `The new insertion is successfully done for ${category}` };
      }
    } else {
      await mainCollection.updateOne(
        { type: collection_type },
        { $push: { data: { category, content: [meta_data] } } }
      );

      return {success:true, message: `The new category ${category} is added successfully` };
    }
  }
}

module.exports = { insertData };
