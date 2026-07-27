async function insertData(tempDoc, mainCollection) {
    try {
        const { collection_type, category, meta_data } = tempDoc;

        if (!collection_type || !category || !meta_data) {
            throw new Error("Missing required fields");
        }

        const allowedCategories = [
            "teaching_staff",
            "non_teaching_staff"
        ];

        if (!allowedCategories.includes(category)) {
            throw new Error(`Insert is not supported for category: ${category}`);
        }

        const result = await mainCollection.updateOne(
            {
                type: collection_type,
                "data.category": category
            },
            {
                $push: {
                    "data.$.members": meta_data.members
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new Error("Category not found");
        }

        return {
            success: true,
            message: "Staff inserted successfully"
        };

    } catch (error) {
        throw new Error(`Internal Server Error: ${error.message}`);
    }
}

module.exports = { insertData };