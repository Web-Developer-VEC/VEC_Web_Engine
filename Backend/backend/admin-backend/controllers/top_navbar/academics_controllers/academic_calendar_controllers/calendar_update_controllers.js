async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data } = tempDoc;

    if (collection_type !== "academic_calendar") {
      throw new Error("Invalid collection type");
    }

    const newYear = meta_data.year;
    const origYear = original_data.year;
    const type = meta_data.type;

    if (!newYear || !origYear) {
      throw new Error("year is required");
    }

    const existingDoc = await mainCollection.findOne(
      { type: "academic_calendar", "data.year": origYear },
      { projection: { "data.$": 1 } }
    );

    if (!existingDoc?.data?.length) {
      throw new Error(`Academic year ${origYear} not found`);
    }
    const existingPdfPaths = existingDoc.data[0].pdf_path || ["", ""];

    let incomingPdfPaths;

    if (Array.isArray(meta_data.pdf_path)) {
      incomingPdfPaths = meta_data.pdf_path;
    } else if (typeof meta_data.pdf_path === "string") {
      // Update only the first PDF by default
      incomingPdfPaths = [meta_data.pdf_path, undefined];
    } else {
      incomingPdfPaths = [];
    }
    const finalPdfPaths = [0, 1].map(index => {
      const incoming = incomingPdfPaths[index];
      const existing = existingPdfPaths[index] || "";

      if (incoming === undefined) return existing;

      if (incoming === "") return "";

      return incoming;
    });

    let finalPdfPaths = [...existingPdfPaths];

    if (type !== undefined) {
      if (type === "odd") {
        finalPdfPaths[0] = meta_data.pdf_path?.[0] ?? existingPdfPaths[0];
      }
      else if (type === "even") {
        finalPdfPaths[1] = meta_data.pdf_path?.[0] ?? existingPdfPaths[1];
      }
    }
    else {

      finalPdfPaths = [0, 1].map(index => {
        const incoming = incomingPdfPaths[index];
        const existing = existingPdfPaths[index] || "";

        if (incoming === undefined) return existing;
        if (incoming === "") return "";

        return incoming;
      });
    }
    const result = await mainCollection.updateOne(
      {
        type: "academic_calendar",
        "data.year": origYear
      },
      {
        $set: {
          "data.$.year": newYear,
          "data.$.pdf_path": finalPdfPaths
        }
      }
    );

    if (!result.matchedCount) {
      throw new Error(`Academic year ${origYear} not found`);
    }

    return {
      success: true,
      message: "Academic calendar updated successfully"
    };

  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
}

module.exports = { updateData };