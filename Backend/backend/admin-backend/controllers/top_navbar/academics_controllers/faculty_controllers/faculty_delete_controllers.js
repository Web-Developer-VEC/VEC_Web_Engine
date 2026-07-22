async function deleteData(tempDoc, mainCollection) {
  try {
    const {
      collection_type,
      category,
      action,
      meta_data,
    } = tempDoc;

    if (action !== "delete") {
      throw new Error("Only delete action is supported.");
    }

    const doc = await mainCollection.findOne({
      type: collection_type,
    });

    if (!doc) {
      throw new Error(`${collection_type} document not found.`);
    }

    const data = Array.isArray(doc.data) ? [...doc.data] : [];

    // Find category
    const sectionIndex = data.findIndex(
      (item) => item.category === category
    );

    if (sectionIndex === -1) {
      throw new Error(`Category '${category}' not found.`);
    }

    // Faculty list PDF category
    if (category === "faculty_pdf_path") {
      data.splice(sectionIndex, 1);

      const result = await mainCollection.updateOne(
        { type: collection_type },
        {
          $set: { data },
        }
      );

      return {
        success: true,
        modifiedCount: result.modifiedCount,
        message: "Faculty PDF deleted successfully.",
      };
    }

    const members = data[sectionIndex].members || [];

    const memberIndex = members.findIndex(
      (member) =>
        member.unique_id === meta_data.members.unique_id
    );

    if (memberIndex === -1) {
      throw new Error("Faculty member not found.");
    }

    // Remove member
    members.splice(memberIndex, 1);

    // Remove category if empty
    if (members.length === 0) {
      data.splice(sectionIndex, 1);
    } else {
      data[sectionIndex].members = members;
    }

    const result = await mainCollection.updateOne(
      { type: collection_type },
      {
        $set: { data },
      }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: "Faculty deleted successfully.",
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { deleteData };