async function updateData(tempDoc, mainCollection) {
  try {
    const {
      collection_type,
      category,
      action,
      meta_data,
      original_data,
    } = tempDoc;

    if (action !== "update") {
      throw new Error("Only update action is supported.");
    }

    const doc = await mainCollection.findOne({ type: collection_type });

    if (!doc) {
      throw new Error(`${collection_type} document not found.`);
    }

    const data = Array.isArray(doc.data) ? [...doc.data] : [];

    const sectionIndex = data.findIndex(
      s => s.category === category
    );

    if (sectionIndex === -1) {
      throw new Error(`Category '${category}' not found.`);
    }

    // Faculty List PDF
    if (category === "faculty_pdf_path") {

      data[sectionIndex].content = {
        ...(data[sectionIndex].content || {}),
        ...(meta_data || {})
      };

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data } }
      );

      return {
        success: true,
        message: "Faculty PDF updated."
      };
    }

    const members = data[sectionIndex].members || [];

    const memberIndex = members.findIndex(m =>
      m.unique_id === original_data.members.unique_id
    );

    if (memberIndex === -1) {
      console.log("Category:", category);
      console.log("Original unique_id:", original_data);
      console.log(
        "Members:",
        members.map(m => m.unique_id)
      );
      throw new Error("Member not found.");
    }

    members[memberIndex] = {
      ...members[memberIndex],
      ...meta_data.members,
      unique_id:
        meta_data.members.unique_id ||
        members[memberIndex].unique_id
    };

    data[sectionIndex].members = members;

    const result = await mainCollection.updateOne(
      { type: collection_type },
      { $set: { data } }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: "Faculty updated successfully."
    };

  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { updateData };