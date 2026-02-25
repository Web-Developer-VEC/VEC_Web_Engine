async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category, original_data } = tempDoc;

    if (!collection_type || !meta_data || !category || !original_data) {
      throw new Error(
        "meta data and collection type and category and original data is required"
      );
    }
    if (collection_type !== "faculty") {
      throw new Error("Incorrect collection type or route");
    }

    if (
      category === "head_of_department" ||
      category === "teaching_staff" ||
      category === "non_teaching_staff"
    ) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { "data.$[elem].members.$[con]": meta_data } },
        {
          arrayFilters: [
            { "elem.category": category },
            { "con.unique_id": original_data.unique_id },
          ],
        }
      );

      return { message: `The  faculty is updated in ${category} successfully` };
    } else if (category === "faculty_pdf_path") {
  const new_data = Array.isArray(meta_data)
    ? meta_data.map(item => (typeof item === "string" ? item : Object.values(item)[0]))
    : [typeof meta_data === "string" ? meta_data : Object.values(meta_data)[0]];

  const old_data = Array.isArray(original_data)
    ? original_data.map(item => (typeof item === "string" ? item : Object.values(item)[0]))
    : [typeof original_data === "string" ? original_data : Object.values(original_data)[0]];

  let result;
  for (let i = 0; i < old_data.length; i++) {
    console.log("Replace:", old_data[i], "→", new_data[i]);

    result = await mainCollection.updateOne(
      { type: collection_type, "data.category": category },
      { $set: { "data.$.content.$[elem]": new_data[i] } },   // new value
      { arrayFilters: [{ "elem": old_data[i] }] }            // old value
    );
  }

  console.log(result);

  return {
    message: `The faculty pdf is updated in ${category} successfully`,
  };
}
else {
      throw new Error("no category is found");
    }
  } catch (error) {
    console.error("error in updating", error);
    throw error;
  }
}

module.exports = { updateData };
