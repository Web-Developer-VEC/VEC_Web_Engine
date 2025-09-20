async function insertData(tempDoc, mainCollection) {

    try{
    const{collection_type, meta_data, category } = tempDoc;

    if(!collection_type || !meta_data || !category) {

        throw new Error("collection_type, meta_data and category is required");
        
    };

    const doc = await mainCollection.findOne({type:collection_type});

    if(doc){

    if(collection_type === "infrastructure"){

        if(category === "infrastructure_images"){
            
           await mainCollection.updateOne(
                {type:collection_type, "data.category":category},
                {$push:{"data.$.content":meta_data}}
            );
            

            return{message:`thet data is inserted successfully in the ${collection_type}`}
        }else{
            
            await mainCollection.updateOne(
                {type:collection_type},
                {$push:{data:{category:category,meta_data}}}
            );

        }
    }
}
}catch (error) {
    console.error("Error inserting data:", error);
    throw error; 
  }
    
}

module.exports = {insertData};