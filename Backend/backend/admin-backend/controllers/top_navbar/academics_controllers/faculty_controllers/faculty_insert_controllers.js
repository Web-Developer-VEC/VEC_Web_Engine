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

    const data = Array.isArray(doc.data) ? doc.data : [];
    const name = String(meta_data.name || "").trim();
    const mail = String(meta_data.mail_id || "").trim();

    const payload = { ...meta_data };
    if (!String(payload.unique_id || "").trim()) {
      const typeCode =
        key === "HOD" ? "H" : key === "FACULTY" ? "F" : key === "NON_TEACHING_FACULTY" ? "NF" : "";

      let deptId = "000";
      const collectionName = String(tempDoc?.collection || "").trim();
      const matchFromCollection = collectionName.match(/_(\d{3})_staff$/i);
      if (matchFromCollection) {
        deptId = matchFromCollection[1];
      } else {
        for (const member of data) {
          const uid = String(member?.unique_id || "").trim();
          const matchFromUid = uid.match(/^VEC-(\d{3})-[A-Z]+-\d+$/i);
          if (matchFromUid) {
            deptId = matchFromUid[1];
            break;
          }
        }
      }

      const serials = [];
      const serialLengths = [];
      for (const member of data) {
        const uid = String(member?.unique_id || "").trim();
        const regex = new RegExp(`^VEC-${deptId}-${typeCode}-(\\d+)$`, "i");
        const match = uid.match(regex);
        if (!match) continue;
        serials.push(Number(match[1]));
        serialLengths.push(match[1].length);
      }

      const maxSerial = serials.length ? Math.max(...serials) : 0;
      const nextSerial = maxSerial + 1;
      const minPad = typeCode === "H" ? 3 : 2;
      const width = Math.max(minPad, ...(serialLengths.length ? serialLengths : [0]));

      payload.unique_id = `VEC-${deptId}-${typeCode}-${String(nextSerial).padStart(width, "0")}`;
    }

    const uniqueId = String(payload.unique_id || "").trim();

    const existing = data.find((member) => {
      const memberUniqueId = String(member.unique_id || "").trim();
      if (uniqueId && memberUniqueId) {
        return memberUniqueId === uniqueId;
      }

      if (key === "HOD") {
        return String(member.name || "").trim() === name;
      }

      if (mail) {
        return (
          String(member.name || "").trim() === name &&
          String(member.mail_id || "").trim() === mail
        );
      }

      return String(member.name || "").trim() === name;
    });

    if (existing) {
      throw new Error(`Duplicate entry: ${key} member "${name}" already exists`);
    }

    const result = await mainCollection.updateOne(
      { type: key },
      { $push: { data: payload } }
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
      unique_id: payload.unique_id || null,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error in insertData:", error);
    throw error;
  }
}

module.exports = { insertData };
