const { insertData } = require("./other_facilities_insert_controllers");
const { deleteData } = require("./other_facilities_delete_controllers");
const { updateData } = require("./other_facilities_update_controllers");

async function handleTempAction(req, res) {
  try {

    const { tempDoc, mainCollection, tempCollection } = req;

    let result;
    switch (tempDoc.action) {
      case "insert":
        result = await insertData(tempDoc, mainCollection);
        break;
      case "delete":
        result = await deleteData(tempDoc, mainCollection);
        break;
      case "update":
        result = await updateData(tempDoc, mainCollection);
        break;

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

   // ✅ Only set approved if the controller succeeded
    await tempCollection.updateOne(
      { _id: tempDoc._id },
      { $set: { status: "approved" } }
    );

    return res.json({
      success: true,
      action: tempDoc.action,
      ...result
    });
  } catch (error) {
    console.error(error);

    // ❌ Do not change status (stays pending if controller failed)
    return res.status(500).json({ success: false, error: error.message });
  }
}


module.exports = { handleTempAction };
