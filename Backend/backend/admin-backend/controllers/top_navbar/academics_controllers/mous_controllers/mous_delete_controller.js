async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;
  if (collection_type !== "mous") {
    throw new Error("Incorrect collection type or route");
  }

  await mainCollection.updateOne(
    { type: collection_type },
    {
      $pull: {
        "data.$[d].content": {
          ORGANISATION_NAME: meta_data.ORGANISATION_NAME
        }
      }
    },
    {
      arrayFilters: [{ "d.category": category }]
    }
  );

  return {success:true,  message: "MoU deleted successfully" };
}


module.exports = { deleteData };
