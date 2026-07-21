async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !category || !meta_data) {
      throw new Error(
        "collection_type, category and meta_data are required"
      );
    }

    if (collection_type !== "newsletter") {
      throw new Error("Incorrect collection type or route");
    }

    // Delete from newsletter content
    if (category === "newsletter") {
      // 1. Remove the pdf from the matching year
      const removePdfResult = await mainCollection.updateOne(
        {
          type: collection_type,
          data: {
            $elemMatch: {
              category: "newsletter",
              "content.year": meta_data.year
            }
          }
        },
        {
          $pull: {
            "data.$.content.$[content].pdf_path": {
              $in: meta_data.pdf_path
            }
          }
        },
        {
          arrayFilters: [
            {
              "content.year": meta_data.year
            }
          ]
        }
      );

      if (removePdfResult.matchedCount === 0) {
        return {
          success: false,
          message: "Year not found."
        };
      }

      // 2. Fetch document to check whether pdf_path became empty
      const doc = await mainCollection.findOne({
        type: collection_type
      });

      const newsletter = doc.data.find(
        item => item.category === "newsletter"
      );

      const yearData = newsletter?.content.find(
        item => item.year === meta_data.year
      );

      // 3. If no PDFs left, remove the year object
      if (yearData && yearData.pdf_path.length === 0) {
        await mainCollection.updateOne(
          {
            type: collection_type,
            "data.category": "newsletter"
          },
          {
            $pull: {
              "data.$.content": {
                year: meta_data.year
              }
            }
          }
        );
      }

      return {
        success: true,
        message: "Newsletter deleted successfully."
      };
    }

    // Delete entire category
    await mainCollection.updateOne(
      {
        type: collection_type
      },
      {
        $pull: {
          data: {
            category: category
          }
        }
      }
    );

    return {
      success: true,
      message: `${category} deleted successfully.`
    };

  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
}

module.exports = { deleteData };