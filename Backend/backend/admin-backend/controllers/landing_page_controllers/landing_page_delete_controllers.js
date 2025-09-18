async function deleteData(tempDoc, mainCollection) {
    try {
        let { collection_type, meta_data } = tempDoc;

        if (!collection_type || !meta_data) {
            throw new Error("Missing required fields: collection_type or meta_data");
        }

        const doc = await mainCollection.findOne({ type: collection_type });

        const multipleObjectTypes = ["notifications", "announcements", "events", "department_banner"];

        if (multipleObjectTypes.includes(collection_type)) {

            if (!doc) {
                throw new Error("Document with the specified collection_type not found");
            }

            await mainCollection.updateOne(
                { type: collection_type },
                { $pull: { data: meta_data } }
            );

            return { message: `Data deleted successfully into ${collection_type}`};
        }

          } catch (error) {
        throw new Error(`Internal Server Error: ${error.message}`);
    }
}

module.exports = { deleteData };




