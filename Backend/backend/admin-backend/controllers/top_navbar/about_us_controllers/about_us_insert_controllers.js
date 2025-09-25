async function insertData(tempDoc, mainCollection ) {
try{
    const { collection_type, category, meta_data} = tempDoc;

    if(!collection_type  || !meta_data){
        throw new Error("Missing required fields: collection_type, category, or meta_data");
    }
    
    const doc = await mainCollection.findOne({ type: collection_type });

    const singleDocTypes = [ "about_trust", "vision_and_mission", "Management", "contact_us"];

    const categoryBasedtypes = ["AISHE"];

    if(!doc){
        throw new Error(`Document with type ${collection_type} not found`);
    };

    if (collection_type === "about_vec"){

        await mainCollection.updateOne(
            {type:"about_vec"},
            {$push:{"data.about_us_pdf":meta_data}}
        );

        return{message:"The data is inserted into about_vec pdf links"}
    }
    if(singleDocTypes.includes(collection_type)){
        await mainCollection.updateOne(
            { type: collection_type },
            { $set: { data: meta_data } }
        );
    }
    else if(categoryBasedtypes.includes(collection_type)){
        if(!category){
            throw new Error("Category is required for this collection type");
        }
        const existingCategoryIndex = doc.data.findIndex(item => item.category === category);
        if(existingCategoryIndex !== -1){
            await mainCollection.updateOne(
                { type: collection_type, "data.category": category },
                { $push: { "data.$.content": meta_data } }
            );
            return{message:`Inserted data into  in ${collection_type}`};
        } else {
            await mainCollection.updateOne(
                { type: collection_type },
                { $addToSet: { data: { category, content: meta_data } } }
            );
            return{message:`Inserted data into existing category ${category} in ${collection_type}`};
        }
    }
}catch(error){
    throw new Error(`Error inserting data: ${error.message}`);
}
}

module.exports = { insertData };