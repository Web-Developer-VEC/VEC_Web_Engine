async function updateData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data, original_data } = tempDoc;

  if (collection_type !== "mous") {
    throw new Error("Incorrect collection type or route");
  }

  const result = await mainCollection.updateOne(
    { type: collection_type },
    {
      $set: {
        "data.$[d].content.$[r].organisation_name":
          meta_data.organisation_name,
        "data.$[d].content.$[r].month_and_year":
          meta_data.month_and_year,
        "data.$[d].content.$[r].validity":
          meta_data.validity,
      },
    },
    {
      arrayFilters: [
        { "d.category": category },
        { "r.organisation_name": original_data.organisation_name },
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