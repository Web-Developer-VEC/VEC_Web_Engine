async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }
  if (collection_type !== "research") {
    throw new Error("Incorrect collection type or route");
  }
  // Delete entire year
  if (
    meta_data.year &&
    (!meta_data.research || meta_data.research.length === 0)
  ) {
    const result = await mainCollection.updateOne(
      { type: collection_type },
      {
        $pull: {
          "data.$[d].content": {
            year: meta_data.year,
          },
        },
      },
      {
        arrayFilters: [
          { "d.category": category },
        ],
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error(`Year ${meta_data.year} not found`);
    }

    return {
      success: true,
      message: `Research year ${meta_data.year} deleted successfully`,
    };
  }
  if (collection_type === "research") {


    if (meta_data && Object.keys(meta_data).length === 0) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: { category: category } } } // remove the whole object with matching category
      );

      return { success: true, message: `Category ${category} deleted successfully` };
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
    for (let item of meta_data.research) {
      await mainCollection.updateOne(
        { type: collection_type },
        {
          $pull: {
            "data.$[d].content.$[c].research": { name: item.name },
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
      success: true,
      message: `Research data deleted successfully for category ${category} and year ${meta_data.year}`,
    };
  }
}

module.exports = { deleteData };
