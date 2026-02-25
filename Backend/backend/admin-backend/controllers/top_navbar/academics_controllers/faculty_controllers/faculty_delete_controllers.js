async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data || !category ) {
      throw new Error("meta data and collection type and category  is required");
    }
    if (collection_type !== "faculty") {
      throw new Error("Incorrect collection type or route");
    }

    const docs = await mainCollection.findOne({type:collection_type})
    if (category === "head_of_department" || category === "teaching_staff" || category === "non_teaching_staff") {

      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { "data.$[elem].members": meta_data } },
        {
          arrayFilters: [
            { "elem.category": category }
          ],
        }
      );

      return { message: `The  faculty is deleted in ${category} successfully` };

    } else if (category === "faculty_pdf_path") {
      const new_data = Array.isArray(meta_data)
    ? meta_data.map(item => (typeof item === "string" ? item : Object.values(item)[0]))
    : [typeof meta_data === "string" ? meta_data : Object.values(meta_data)[0]];

        for (let i = 0; i < new_data.length; i++) {
            await mainCollection.updateOne(
                { type: collection_type, "data.category": category },
                { $pull: { "data.$.content": new_data[i] } }
            );

            }

      return {
        message: `The faculty pdf is deleted in ${category} successfully`,
      };
    } else {
      throw new Error("no category is found");
    }
  } catch (error) {
    console.error("error in deleting", error);
    throw error;
  }
}

module.exports = { deleteData };
