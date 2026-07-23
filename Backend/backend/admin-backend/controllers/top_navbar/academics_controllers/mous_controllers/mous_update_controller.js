async function updateData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data, original_data } = tempDoc;

  if (collection_type !== "mous") {
    throw new Error("Incorrect collection type or route");
  }

  const result = await mainCollection.updateOne(
    { type: collection_type },
    {
      $set: {
        "data.$[d].content.$[r].ORGANISATION_NAME":
          meta_data.ORGANISATION_NAME,
        "data.$[d].content.$[r].MONTH_AND_YEAR":
          meta_data.MONTH_AND_YEAR,
        "data.$[d].content.$[r].VALIDITY":
          meta_data.VALIDITY,
      },
    },
    {
      arrayFilters: [
        { "d.category": category },
        { "r.ORGANISATION_NAME": original_data.ORGANISATION_NAME },
      ],
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("MoU document not found");
  }

  if (result.modifiedCount === 0) {
    throw new Error("No matching MoU record found or no changes made");
  }

  return {
    success: true,
    message: "MoU updated successfully",
  };
}

module.exports = { updateData };