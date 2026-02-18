async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }

  if (collection_type !== "pedagogy") return;

  const doc = await mainCollection.findOne({ type: collection_type });
  if (!doc) {
    throw new Error(`No document found for collection_type: ${collection_type}`);
  }

  const categoryExist = doc.data.find((c) => c.category === category);
  const insert = Array.isArray(meta_data.content)
    ? meta_data.content
    : [meta_data.content];

  if (categoryExist) {
    const yearExist = categoryExist.content.find((e) => e.year === meta_data.year);

    // Category + year exists: append content.
    if (yearExist) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $push: { "data.$[d].content.$[c].content": { $each: insert } } },
        { arrayFilters: [{ "d.category": category }, { "c.year": meta_data.year }] }
      );

      return {
        message: `Pedagogy content inserted successfully for ${category} - ${meta_data.year}`,
      };
    }

    // Category exists, year does not: add a new year block.
    await mainCollection.updateOne(
      { type: collection_type, "data.category": category },
      { $push: { "data.$.content": { ...meta_data, content: insert } } }
    );

    return {
      message: `New year ${meta_data.year} inserted successfully for ${category}`,
    };
  }

  // Category does not exist: add new category and year.
  await mainCollection.updateOne(
    { type: collection_type },
    { $push: { data: { category, content: [{ ...meta_data, content: insert }] } } }
  );

  return { message: `New category ${category} inserted successfully` };
}

module.exports = { insertData };
