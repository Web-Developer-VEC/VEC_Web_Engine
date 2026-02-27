/**
 * Insert faculty data into the correct document by type
 */
async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    // ==================== Validation ====================
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    const key = String(collection_type).toUpperCase();

    if (!["HOD", "FACULTY", "NON_TEACHING_FACULTY"].includes(key)) {
      throw new Error(`Invalid collection_type: ${collection_type}`);
    }

    // ==================== Find the correct document by type ====================
    const doc = await mainCollection.findOne({ type: key });

    if (!doc) {
      throw new Error(
        `Document with type '${key}' not found. Available types: HOD, FACULTY, NON_TEACHING_FACULTY`
      );
    }

    // ==================== Check for duplicates ====================
    if (meta_data.Name && meta_data.Mail_ID) {
      const existing = doc.data?.find(
        member => member.Name === meta_data.Name && member.Mail_ID === meta_data.Mail_ID
      );

      if (existing) {
        throw new Error(
          `Duplicate entry: ${key} member "${meta_data.Name}" (${meta_data.Mail_ID}) already exists`
        );
      }
    }

    // ==================== Insert into data array ====================
    const result = await mainCollection.updateOne(
      { type: key },
      { $push: { data: meta_data } }
    );

    if (result.matchedCount === 0) {
      throw new Error(`Failed to find document with type '${key}'`);
    }

    if (result.modifiedCount === 0) {
      throw new Error(`Matched document but failed to insert into ${key}`);
    }

    console.log(`✅ Inserted into ${key}: ${meta_data.Name || 'New member'}`);

    return {
      success: true,
      message: `Successfully inserted ${meta_data.Name || 'member'} into ${key}`,
      type: key,
      modifiedCount: result.modifiedCount
    };

  } catch (error) {
    console.error("❌ Error in insertData:", error);
    throw error;
  }
}

module.exports = { insertData };