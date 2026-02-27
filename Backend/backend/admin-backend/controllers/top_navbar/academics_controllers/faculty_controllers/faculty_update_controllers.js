/**
 * Update faculty data
 * Supports: HOD, FACULTY, NON_TEACHING_FACULTY
 */
async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, action, meta_data, original_data } = tempDoc;

    // ==================== Validation ====================
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    if (action && action !== "update") {
      throw new Error("This function only handles 'update' action");
    }

    const key = String(collection_type).toUpperCase();

    if (!["HOD", "FACULTY", "NON_TEACHING_FACULTY"].includes(key)) {
      throw new Error(`Invalid collection_type: ${collection_type}`);
    }

    // ==================== Handle Section Clear (Empty Array) ====================
    if (Array.isArray(meta_data) && meta_data.length === 0) {
      const result = await mainCollection.updateOne(
        { type: key },
        { $set: { data: [] } }
      );

      if (result.matchedCount === 0) {
        throw new Error(`Document with type '${key}' not found`);
      }

      console.log(`✅ Cleared ${key} section`);

      return {
        success: true,
        message: `${key} section cleared successfully`,
        modifiedCount: result.modifiedCount
      };
    }

    // ==================== Validate original_data ====================
    if (!original_data || !original_data.Name) {
      throw new Error("original_data with Name is required to identify the member");
    }

    // For FACULTY and NON_TEACHING_FACULTY, also require Mail_ID for uniqueness
    if ((key === "FACULTY" || key === "NON_TEACHING_FACULTY") && !original_data.Mail_ID) {
      throw new Error(`original_data with Name and Mail_ID is required for ${key}`);
    }

    // ==================== Find Document by Type ====================
    const doc = await mainCollection.findOne({ type: key });

    if (!doc) {
      throw new Error(`Document with type '${key}' not found`);
    }

    // ==================== Find Member in data Array ====================
    let memberIndex = -1;
    
    if (key === "HOD") {
      // HOD: Match by Name only (typically single HOD)
      memberIndex = doc.data?.findIndex(m => m.Name === original_data.Name);
    } else {
      // FACULTY & NON_TEACHING_FACULTY: Match by Name AND Mail_ID
      memberIndex = doc.data?.findIndex(
        m => m.Name === original_data.Name && m.Mail_ID === original_data.Mail_ID
      );
    }

    if (memberIndex === -1) {
      throw new Error(
        `${key} member "${original_data.Name}" not found in the data array`
      );
    }

    // ==================== Update Using Positional Operator ====================
    let filter, update;

    if (key === "HOD") {
      filter = {
        type: key,
        "data.Name": original_data.Name
      };
    } else {
      filter = {
        type: key,
        data: {
          $elemMatch: {
            Name: original_data.Name,
            Mail_ID: original_data.Mail_ID
          }
        }
      };
    }

    update = {
      $set: { "data.$": meta_data }
    };

    const result = await mainCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      throw new Error(`Failed to find ${key} member "${original_data.Name}"`);
    }

    if (result.modifiedCount === 0) {
      throw new Error(`${key} member found but update failed (data might be identical)`);
    }

    console.log(`✅ Updated ${key}: ${meta_data.Name || original_data.Name}`);

    return {
      success: true,
      message: `${key} member "${meta_data.Name || original_data.Name}" updated successfully`,
      type: key,
      modifiedCount: result.modifiedCount
    };

  } catch (error) {
    console.error("❌ Error in updateData:", error);
    throw error;
  }
}

module.exports = { updateData };