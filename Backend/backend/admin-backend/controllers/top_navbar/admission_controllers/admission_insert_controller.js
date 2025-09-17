
const allowedTypes = ["ug", "pg", "mba", "phd", "admission_team"];
const insertAllowed = ["ug", "pg", "admission_team"];

async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;
    if (!collection_type || !meta_data) throw new Error("collection_type and meta_data required");

    // 1. Only allow known collection_types
    if (!allowedTypes.includes(collection_type)) {
      return { success: false, message: `Insert is not allowed for unknown collection_type "${collection_type}".` };
    }

    // 2. MBA & PhD cannot be inserted
    if (["mba", "phd"].includes(collection_type)) {
      return { success: false, message: `Insert is not allowed for "${collection_type}". Use the update controller instead.` };
    }

    // 3. Only ug, pg, admission_team allowed for insert
    if (!insertAllowed.includes(collection_type)) {
      return { success: false, message: `Insert is not allowed for "${collection_type}".` };
    }

    // 4. Find the existing doc
    let doc = await mainCollection.findOne({ type: collection_type });

    // 5. Fix legacy: If doc.data is an array, flatten to object
    if (doc && Array.isArray(doc.data) && doc.data.length === 1 && typeof doc.data[0] === "object") {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: doc.data[0] } }
      );
      doc.data = doc.data[0];
    }

    // 6. Admission team: always append to array
    if (collection_type === "admission_team") {
      let staffToInsert = Array.isArray(meta_data)
        ? meta_data.flat(Infinity).filter(item => typeof item === "object" && !Array.isArray(item))
        : [meta_data];
      if (doc) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $push: { data: { $each: staffToInsert } } }
        );
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: staffToInsert,
        });
      }
      return { success: true, message: "admission_team staff appended" };
    }

    // 7. UG/PG: append/merge inside existing year only
    if (["ug", "pg"].includes(collection_type)) {
      // Map array keys
      const arrayKeys = {
        ug: ["UG", "UG_Lateral"],
        pg: ["PG"],
      };
      const keysForType = arrayKeys[collection_type] || [];

      if (doc) {
        if (doc.data && typeof doc.data === "object" && !Array.isArray(doc.data) && "year" in doc.data) {
          const docYear = doc.data.year;
          const reqYear = meta_data.year || (meta_data.data && meta_data.data.year);
          if (reqYear && reqYear !== docYear) {
            return { success: false, message: `Year mismatch! Current year is ${docYear}. Use update controller to change year.` };
          }

          // Helper to merge department arrays
          function mergeDeptArray(existingArr, newArr) {
            const existingNames = new Set(existingArr.map(obj => Object.keys(obj)[0]));
            const toAdd = newArr.filter(obj => !existingNames.has(Object.keys(obj)[0]));
            return existingArr.concat(toAdd);
          }

          let updateOps = {};
          for (const key of keysForType) {
            if (meta_data[key] && Array.isArray(meta_data[key])) {
              const existingArr = doc.data[key] || [];
              const mergedArr = mergeDeptArray(existingArr, meta_data[key]);
              updateOps[`data.${key}`] = mergedArr;
            }
          }
          for (const [key, value] of Object.entries(meta_data)) {
            if (!keysForType.includes(key) && key !== "year") {
              updateOps[`data.${key}`] = value;
            }
          }
          if (Object.keys(updateOps).length > 0) {
            await mainCollection.updateOne({ type: collection_type }, { $set: updateOps });
            return { success: true, message: `${collection_type} appended/merged inside existing year` };
          } else {
            return { success: true, message: `No new data to append.` };
          }
        } else {
          return { success: false, message: `Existing document shape invalid for ${collection_type}`, docShape: doc };
        }
      } else {
        // Only insert if truly no doc exists for this type
        await mainCollection.insertOne({
          type: collection_type,
          data: meta_data,
        });
        return { success: true, message: `${collection_type} data inserted as new document` };
      }
    }

    // Should never reach here
    return { success: false, message: "Unknown error in insert controller." };

  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { insertData };