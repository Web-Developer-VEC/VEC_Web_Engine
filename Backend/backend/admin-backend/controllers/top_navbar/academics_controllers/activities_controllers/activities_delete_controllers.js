async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || meta_data === undefined) {
    throw new Error("collection_type, category and meta_data are required");
  }

  if (collection_type !== "activities") {
    throw new Error("Incorrect collection type or route");
  }


  const doc = await mainCollection.findOne({ type: collection_type });

  if (!doc) {
    throw new Error(
      `No document found for collection_type: ${collection_type}`
    );
  }

  const categoryExist = doc.data.find(
    (c) => c.category === category
  );

  if (!categoryExist) {
    throw new Error(`Category ${category} does not exist`);
  }

  const yearExist = categoryExist.content.find(
    (c) => c.year === meta_data.year
  );

  if (!yearExist) {
    throw new Error(
      `Year ${meta_data.year} does not exist in category ${category}`
    );
  }

  // ----------------------------
  // Delete one or more activity PDFs
  // ----------------------------
  if (
    Array.isArray(meta_data.activities_tile) &&
    meta_data.activities_tile.length > 0
  ) {
    for (const activity of meta_data.activities_tile) {
      await mainCollection.updateOne(
        { type: collection_type },
        {
          $set: {
            "data.$[d].content.$[c].activities_tile.$[a].pdf_path": "",
          },
        },
        {
          arrayFilters: [
            { "d.category": category },
            { "c.year": meta_data.year },
            { "a.name": activity.name },
          ],
        }
      );
    }

    return {
      success: true,
      message: "Selected activity PDF(s) deleted successfully",
    };
  }

  // ----------------------------
  // Delete entire year
  // ----------------------------
  await mainCollection.updateOne(
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

  return {
    success: true,
    message: `Year ${meta_data.year} deleted successfully`,
  };
}

module.exports = { deleteData };