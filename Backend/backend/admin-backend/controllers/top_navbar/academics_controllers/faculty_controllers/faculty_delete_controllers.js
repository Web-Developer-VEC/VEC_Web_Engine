/**
 * Delete faculty data
 * Supports: HOD, FACULTY, NON_TEACHING_FACULTY
 */
async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, action, meta_data } = tempDoc;

    // ==================== Validation ====================
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    if (action && action !== "delete") {
      throw new Error("This function only handles 'delete' action");
    }

    const key = String(collection_type).toUpperCase();

    if (!["HOD", "FACULTY", "NON_TEACHING_FACULTY"].includes(key)) {
      throw new Error(`Invalid collection_type: ${collection_type}`);
    }

    // ==================== Find Document by Type ====================
    const doc = await mainCollection.findOne({ type: key });

    if (!doc) {
      throw new Error(`Document with type '${key}' not found`);
    }

    // ==================== Handle Section Clear (Delete All) ====================
    if (Array.isArray(meta_data) && meta_data.length === 0) {
      const memberCount = doc.data?.length || 0;

      const result = await mainCollection.updateOne(
        { type: key },
        { $set: { data: [] } }
      );

      console.log(`✅ Cleared ${key} section (${memberCount} members)`);

      return {
        success: true,
        message: `${key} section cleared successfully`,
        modifiedCount: result.modifiedCount,
        membersDeleted: memberCount
      };
    }

    // ==================== Handle Single Member Delete ====================
    if (!meta_data.Name) {
      throw new Error("meta_data with Name is required to identify member to delete");
    }

    // For FACULTY and NON_TEACHING_FACULTY, also require Mail_ID
    if ((key === "FACULTY" || key === "NON_TEACHING_FACULTY") && !meta_data.Mail_ID) {
      throw new Error(`meta_data with Name and Mail_ID is required for ${key}`);
    }

    // Verify member exists
    let memberExists;
    if (key === "HOD") {
      memberExists = doc.data?.find(m => m.Name === meta_data.Name);
    } else {
      memberExists = doc.data?.find(
        m => m.Name === meta_data.Name && m.Mail_ID === meta_data.Mail_ID
      );
    }

    if (!memberExists) {
      throw new Error(`${key} member "${meta_data.Name}" not found`);
    }

    // Build delete filter
    let pullFilter;
    if (key === "HOD") {
      pullFilter = { Name: meta_data.Name };
    } else {
      pullFilter = {
        Name: meta_data.Name,
        Mail_ID: meta_data.Mail_ID
      };
    }

    // Delete from database
    const result = await mainCollection.updateOne(
      { type: key },
      { $pull: { data: pullFilter } }
    );

    if (result.modifiedCount === 0) {
      throw new Error(`${key} member "${meta_data.Name}" not found or already deleted`);
    }

    console.log(`✅ Deleted ${key}: ${meta_data.Name}`);

    return {
      success: true,
      message: `${key} member "${meta_data.Name}" deleted successfully`,
      type: key,
      modifiedCount: result.modifiedCount
    };

  } catch (error) {
    console.error("❌ Error in deleteData:", error);
    throw error;
  }
}

module.exports = { deleteData };