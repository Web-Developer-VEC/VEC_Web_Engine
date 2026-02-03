async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data required");
    }

    // Helper: checks if all subfields (except 'year') are empty
    function isDataEmpty(data) {
      if (!data || typeof data !== "object") return true;
      return Object.entries(data).every(
        ([key, val]) =>
          key === "year" ||
          val === null ||
          val === undefined ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === "object" && !Array.isArray(val) && isDataEmpty(val)) ||
          val === ""
      );
    }

    // Helper: checks if all subfields (except 'name') are empty for admission_team member
    function isMemberEmpty(member) {
      if (!member || typeof member !== "object") return true;
      return Object.entries(member).every(
        ([key, val]) =>
          key === "name" ||
          val === null ||
          val === undefined ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === "object" && !Array.isArray(val) && isMemberEmpty(val)) ||
          val === ""
      );
    }

    // --- Admission team: field-level deletion and full member deletion ---
    if (collection_type === "admission_team" && meta_data.name) {
      // Find the admission_team document
      const doc = await mainCollection.findOne({ type: "admission_team" });
      if (!doc) throw new Error("Admission team not found");
      if (!Array.isArray(doc.data)) throw new Error("Admission team data is not an array");

      // Find the index of the member by name (case-insensitive)
      const memberIndex = doc.data.findIndex(
        m => m.name && m.name.toLowerCase() === meta_data.name.toLowerCase()
      );
      if (memberIndex === -1) throw new Error("Admission team member not found");

      let deletedFields = [];

      // If only name is provided: delete the entire member
      if (Object.keys(meta_data).length === 1 && meta_data.name) {
        doc.data.splice(memberIndex, 1);
        deletedFields = ["entire member"];
      } else {
        // Delete fields specified in meta_data (except "name")
        let member = { ...doc.data[memberIndex] };
        for (const key in meta_data) {
          if (key !== "name" && Object.prototype.hasOwnProperty.call(member, key)) {
            delete member[key];
            deletedFields.push(key);
          }
        }
        // Remove member if now empty (except name)
        if (isMemberEmpty(member)) {
          doc.data.splice(memberIndex, 1);
          deletedFields.push("entire member (became empty)");
        } else {
          doc.data[memberIndex] = member;
        }
      }

      // If array is now empty, remove the doc
      if (doc.data.length === 0) {
        await mainCollection.deleteOne({ _id: doc._id });
        return {
          success: true,
          message: `Admission team member "${meta_data.name}" deleted (document removed as team became empty)`
        };
      } else {
        // Otherwise, update the doc
        await mainCollection.updateOne(
          { _id: doc._id },
          { $set: { data: doc.data } }
        );
        return {
          success: true,
          action: "delete",
          message: deletedFields.length > 0
            ? `Deleted field(s): ${deletedFields.join(", ")} for admission team member "${meta_data.name}"`
            : `No fields specified for deletion for "${meta_data.name}", nothing changed.`
        };
      }
    }

    // --- UG/PG/MBA and subarrays (UG_Lateral, etc) ---
    if (
      ["ug", "pg", "mba"].includes(collection_type) &&
      meta_data.year
    ) {
      const arrayKeys = {
        ug: ["UG", "UG_Lateral"],
        pg: ["PG"],
        mba: ["MBA"]
      };
      const keysForType = arrayKeys[collection_type] || [];

      // 1. Handle deletion from subarrays (e.g. UG, UG_Lateral, PG, MBA)
      for (const key of keysForType) {
        if (meta_data[key] && Array.isArray(meta_data[key])) {
          const toDelete = meta_data[key].map(obj => Object.keys(obj)[0]);
          // Validate department names (basic check for typos)
          if (toDelete.some(name => !name || name.length < 3)) {
            throw new Error(`Invalid department name in delete for ${key}`);
          }
          // Defensive: ensure existingArr is always an array
          const docUG = await mainCollection.findOne({ type: collection_type, "data.year": meta_data.year });
          if (!docUG || !docUG.data) continue;
          let existingArr = Array.isArray(docUG.data[key]) ? docUG.data[key] : [];
          let updatedArr = existingArr.filter(
            item => !toDelete.includes(Object.keys(item)[0])
          );
          await mainCollection.updateOne(
            { type: collection_type, "data.year": meta_data.year },
            { $set: { [`data.${key}`]: updatedArr } }
          );
          // If now empty, unset
          if (updatedArr.length === 0) {
            await mainCollection.updateOne(
              { type: collection_type, "data.year": meta_data.year },
              { $unset: { [`data.${key}`]: "" } }
            );
          }
        }
        // If the requested array is empty, user wants to clear it
        if (meta_data[key] && Array.isArray(meta_data[key]) && meta_data[key].length === 0) {
          await mainCollection.updateOne(
            { type: collection_type, "data.year": meta_data.year },
            { $set: { [`data.${key}`]: [] } }
          );
          // Unset if now empty
          const updatedDoc = await mainCollection.findOne({ type: collection_type, "data.year": meta_data.year });
          if (
            updatedDoc &&
            updatedDoc.data &&
            Array.isArray(updatedDoc.data[key]) &&
            updatedDoc.data[key].length === 0
          ) {
            await mainCollection.updateOne(
              { type: collection_type, "data.year": meta_data.year },
              { $unset: { [`data.${key}`]: "" } }
            );
          }
        }
      }
      // After all deletes/unsets, see if only 'year' remains, and delete doc if so
      const updatedDoc = await mainCollection.findOne({ type: collection_type, "data.year": meta_data.year });
      if (updatedDoc && isDataEmpty(updatedDoc.data)) {
        await mainCollection.deleteOne({ _id: updatedDoc._id });
        return {
          success: true,
          message: `All data for year ${meta_data.year} deleted from ${collection_type} (document removed as it became empty)`
        };
      }
      return {
        success: true,
        message: `Requested items deleted from ${collection_type}`
      };
    }

    // --- Delete entire year for UG/PG/MBA ---
    if (
      ["ug", "pg", "mba"].includes(collection_type) &&
      meta_data.year &&
      Object.keys(meta_data).length === 1 // only year provided
    ) {
      await mainCollection.deleteOne({ type: collection_type, "data.year": meta_data.year });
      return {
        success: true,
        message: `All data for year ${meta_data.year} deleted from ${collection_type}`
      };
    }

    // --- Delete entire type (UG/PG/MBA) ---
    if (
      ["ug", "pg", "mba"].includes(collection_type) &&
      Object.keys(meta_data).length === 0
    ) {
      await mainCollection.deleteOne({ type: collection_type });
      return {
        success: true,
        message: `All data for type ${collection_type} deleted`
      };
    }

    // --- PHD: clear link for a year ---
    if (collection_type === "phd" && meta_data.year) {
      await mainCollection.updateOne(
        { type: "phd", "data.year": meta_data.year },
        { $set: { "data.link": "" } }
      );
      // If document now only has year and empty link, delete doc
      const phdDoc = await mainCollection.findOne({ type: "phd", "data.year": meta_data.year });
      if (phdDoc && isDataEmpty(phdDoc.data)) {
        await mainCollection.deleteOne({ _id: phdDoc._id });
        return {
          success: true,
          message: `PhD link cleared for year ${meta_data.year} (document removed as link became empty)`
        };
      }
      return {
        success: true,
        message: `PhD link cleared for year ${meta_data.year}`
      };
    }

    // --- Delete all for PHD ---
    if (collection_type === "phd" && Object.keys(meta_data).length === 0) {
      await mainCollection.deleteOne({ type: "phd" });
      return {
        success: true,
        message: `All data for type phd deleted`
      };
    }

    throw new Error("Invalid collection type or delete criteria");
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
}

module.exports = { deleteData };