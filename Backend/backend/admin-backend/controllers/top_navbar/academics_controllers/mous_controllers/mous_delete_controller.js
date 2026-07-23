async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (collection_type !== "mous") {
    throw new Error("Incorrect collection type or route");
  }

  const result = await mainCollection.updateOne(
    { type: collection_type },
    {
      $pull: {
        "data.$[d].content": {
          organisation_name: meta_data.organisation_name,
        },
      },
    },
    {
      arrayFilters: [{ "d.category": category }],
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("MoU document not found");
  }

  if (result.modifiedCount === 0) {
    throw new Error("MoU record not found");
  }

  return {
    success: true,
    message: "MoU deleted successfully",
  };
}

module.exports = { deleteData };