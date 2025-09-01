const path = require("path");
// const TransportModel = require("../models/transportModel");
// const { getDb } = require("../../main-backend/config/db");

const uploadTransportPdf = async (req, res) => {
  try {
    const { type } = tempDoc; // e.g. type: "transport"

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PDF uploaded" });
    }

    // Build new PDF route (relative to public folder)
    // const pdfPath = `/static/pdfs/transport/${req.file.filename}`;
    // const collection = db.collection("transport");

    // Update MongoDB document
    const updatedDoc = await mainCollection.findOneAndUpdate(
      { type: type }, // match type = "transport"
      { $set: { "data.0.route": pdfPath } }, // update first element route
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "PDF updated successfully",
      data: updatedDoc
    });
  } catch (error) {
    console.error("Error updating PDF:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

async function handleTempaction(params) {
  
}
