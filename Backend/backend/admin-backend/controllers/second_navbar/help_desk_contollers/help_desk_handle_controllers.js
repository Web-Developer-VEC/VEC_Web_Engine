const { updateData } = require("./help_desk_update_controllers");


async function handleTempAction(req, res) {
  try {
    const tempDoc = req.tempDoc;              
    const mainCollection = req.mainCollection; 

    if (tempDoc.status !== "approved") {
      return res.status(400).json({ error: "Action not approved yet" });
    }

    let result;
    switch (tempDoc.action) {
      case "update":
        result = await updateData(tempDoc, mainCollection);
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    return res.json({
      success: true,
      action: tempDoc.action,
      ...result
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { handleTempAction };
