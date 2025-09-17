async function insertData(tempDoc, mainCollection) {
    try {
        let { collection_type, meta_data } = tempDoc;

        if (!collection_type || !meta_data) {
            throw new Error("Missing required fields: collection_type or meta_data");
        }

        const doc = await mainCollection.findOne({ type: collection_type });

        const singleObjectTypes = ["page_details","banner", "special_announcements"]

        const multipleObjectTypes = ["notifications", "announcements", "events", "department_banner"];

        if (multipleObjectTypes.includes(collection_type)) {

            if (!doc) {
                throw new Error("Document with the specified collection_type not found");
            }

            await mainCollection.updateOne(
                { type: collection_type },
                { $push: { data: meta_data } }
            );

            return { message: `Data inserted successfully into ${collection_type}`};
        }

       if(singleObjectTypes.includes(collection_type)){

         if (!doc) {
                throw new Error("Document with the specified collection_type not found");
            }

            
            const new_data = Array.isArray(meta_data)?meta_data:[meta_data];

            await mainCollection.updateOne(
                { type: collection_type },
                { $set: { data: new_data } }
            );

            return { message: `Data inserted successfully into ${collection_type}`};


       }

    } catch (error) {
        throw new Error(`Internal Server Error: ${error.message}`);
    }
}

module.exports = { insertData };




