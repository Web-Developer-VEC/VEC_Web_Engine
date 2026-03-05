async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, action, meta_data } = tempDoc;

    if (!collection_type || meta_data === undefined || meta_data === null) {
      throw new Error("collection_type and meta_data are required");
    }

    if (action && action !== "delete") {
      throw new Error("This function only handles 'delete' action");
    }

    const key = String(collection_type).toUpperCase();

    if (!["HOD", "FACULTY", "NON_TEACHING_FACULTY"].includes(key)) {
      throw new Error(`Invalid collection_type: ${collection_type}`);
    }

    const doc = await mainCollection.findOne({ type: key });

    if (!doc) {
      throw new Error(`Document with type '${key}' not found`);
    }

    if (Array.isArray(meta_data) && meta_data.length === 0) {
      const memberCount = Array.isArray(doc.data) ? doc.data.length : 0;

      const result = await mainCollection.updateOne(
        { type: key },
        { $set: { data: [] } }
      );

      return {
        success: true,
        message: `${key} section cleared successfully`,
        modifiedCount: result.modifiedCount,
        membersDeleted: memberCount,
      };
    }

    const targetName = String(meta_data.name || "").trim();
    const targetMail = String(meta_data.mail_id || "").trim();
    const targetUniqueId = String(meta_data.unique_id || "").trim();

    if (!targetName && !targetUniqueId) {
      throw new Error("meta_data with unique_id or name is required to identify member to delete");
    }

    const data = Array.isArray(doc.data) ? doc.data : [];
    const memberIndex = data.findIndex((member) => {
      const memberUniqueId = String(member.unique_id || "").trim();
      if (targetUniqueId && memberUniqueId) {
        return memberUniqueId === targetUniqueId;
      }

      if (key === "HOD") {
        return String(member.name || "").trim() === targetName;
      }

      if (targetMail) {
        return (
          String(member.name || "").trim() === targetName &&
          String(member.mail_id || "").trim() === targetMail
        );
      }

      return String(member.name || "").trim() === targetName;
    });

    if (memberIndex === -1) {
      throw new Error(`${key} member "${targetName || targetUniqueId}" not found`);
    }

    const updatedData = data.filter((_, index) => index !== memberIndex);

    const result = await mainCollection.updateOne(
      { type: key },
      { $set: { data: updatedData } }
    );

    return {
      success: true,
      message: `${key} member "${targetName || targetUniqueId}" deleted successfully`,
      type: key,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error in deleteData:", error);
    throw error;
  }
}

module.exports = { deleteData };
