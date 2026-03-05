async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    const key = String(collection_type).toUpperCase();

    if (!["HOD", "FACULTY", "NON_TEACHING_FACULTY"].includes(key)) {
      throw new Error(`Invalid collection_type: ${collection_type}`);
    }

    const doc = await mainCollection.findOne({ type: key });

    if (!doc) {
      throw new Error(
        `Document with type '${key}' not found. Available types: HOD, FACULTY, NON_TEACHING_FACULTY`
      );
    }

    const name = meta_data.name || "";
    const mail = meta_data.mail_id || "";
    const uniqueId = meta_data.unique_id || "";

    const existing = (doc.data || []).find((member) => {
      const memberUniqueId = member.unique_id || "";
      if (uniqueId && memberUniqueId) {
        return memberUniqueId === uniqueId;
      }

      if (key === "HOD") {
        return member.name === name;
      }

      if (mail) {
        return member.name === name && member.mail_id === mail;
      }

      return member.name === name;
    });

    if (existing) {
      throw new Error(`Duplicate entry: ${key} member "${name}" already exists`);
    }

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

    return {
      success: true,
      message: `Successfully inserted ${name || "member"} into ${key}`,
      type: key,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error in insertData:", error);
    throw error;
  }
}

module.exports = { insertData };
