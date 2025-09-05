const { insertData } = require("./army_insert_controllers");
const { updateData } = require("./army_update_controllers");
const { deleteData } = require("./army_delete_controllers");
// ------------------- ROUTE HANDLER -------------------
async function handleTempAction(req, res) {
  try {
    const tempDoc = req.tempDoc; // ✅ from handleTempApproval
    const mainCollection = req.mainCollection;

    if (tempDoc.status !== "approved") {
      return res.status(400).json({ error: "Action not approved yet" });
    }
    switch (tempDoc.action) {
      case "insert":
        await insertData(req, res, tempDoc, mainCollection);
        break;
      case "update":
        await updateData(req, res, tempDoc, mainCollection);
        break;
      case "delete":
        await deleteData(req, res, tempDoc, mainCollection);
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    // ✅ send success response once
    // return res.json({ message: `Action '${tempDoc.action}' executed successfully` });s
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
}

module.exports = { handleTempAction };
