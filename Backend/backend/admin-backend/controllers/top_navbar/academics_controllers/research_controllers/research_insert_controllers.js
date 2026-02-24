async function insertData(tempDoc, mainCollection) {
  let { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }

  collection_type = collection_type.trim().toLowerCase();

  if (collection_type !== "research") {
    throw new Error("Invalid collection type");
  }

  const doc = await mainCollection.findOne({ type: collection_type });
  if (!doc) {
    throw new Error(`Main document not found for type: ${collection_type}`);
  }

  const categoryExist = doc.data.find((c) => c.category === category);

  if (categoryExist) {
    const yearExist = categoryExist.content.find(
      (e) => e.year === meta_data.year
    );

    if (yearExist) {
      // ✅ append research to existing year
      await mainCollection.updateOne(
        { type: collection_type },
        {
          $push: {
            "data.$[d].content.$[c].research": {
              $each: meta_data.research,
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

      return { message: `Research appended for ${category} (${meta_data.year})` };
    } else {
      // ✅ create new year entry
      await mainCollection.updateOne(
        { type: collection_type },
        {
          $push: {
            "data.$[d].content": meta_data,
          },
        },
        {
          arrayFilters: [{ "d.category": category }],
        }
      );

      return { message: `New year created for ${category} (${meta_data.year})` };
    }
  } else {
    // ✅ create new category + year
    await mainCollection.updateOne(
      { type: collection_type },
      { $push: { data: { category, content: [meta_data] } } }
    );

    return { message: `New category created: ${category}` };
  }
}

module.exports = { insertData };
