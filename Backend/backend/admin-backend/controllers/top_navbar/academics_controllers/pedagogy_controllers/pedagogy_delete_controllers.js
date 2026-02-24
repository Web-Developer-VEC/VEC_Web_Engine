async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }
  if (collection_type !== "pedagogy") {
    throw new Error("Incorrect collection type or route");
  }

  if (collection_type === "pedagogy") {

    
    if (meta_data && Object.keys(meta_data).length === 0) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: { category: category } } } // remove the whole object with matching category
      );

      return { message: `Category ${category} deleted successfully` };
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc)
      throw new Error(
        `No document found for collection_type: ${collection_type}`
      );

    const categoryExist = doc.data.find((c) => c.category === category);
    if (!categoryExist) throw new Error(`Category ${category} does not exist`);

    const yearExist = categoryExist.content.find(
      (e) => e.year === meta_data.year
    );
    if (!yearExist)
      throw new Error(
        `Year ${meta_data.year} does not exist in category ${category}`
      );

    // Iterate over each item in meta_data.research to delete
    for (let item of meta_data.content) {
      await mainCollection.updateOne(
        { type: collection_type },
        {
          $pull: {
            "data.$[d].content.$[c].content": { name: item.name },
          },
        },
        {
          arrayFilters: [
            { "d.category": category },
            { "c.year": meta_data.year },
          ],
        }
      );
    }

    return {
      message: `Pedagogy data deleted successfully for category ${category} and year ${meta_data.year}`,
    };
  }
}

module.exports = { deleteData };
