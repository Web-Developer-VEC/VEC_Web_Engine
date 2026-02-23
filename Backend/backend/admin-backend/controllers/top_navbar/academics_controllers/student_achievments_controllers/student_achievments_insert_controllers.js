async function insertData(tempDoc, mainCollection) {

    try{
    const{collection_type, meta_data, category } = tempDoc;

    if(!collection_type || !meta_data || !category) {

        throw new Error("collection_type, meta_data and category is required");
        
    };
    if (collection_type !== "student_achievements") {
        throw new Error("Incorrect collection type or route");
    }

    const doc = await mainCollection.findOne({type:collection_type});

    if(doc){

    if(collection_type === "student_achievements"){

        if(category === "student_achievements_details" ){
            
           await mainCollection.updateOne(
                {type:collection_type, "data.category":category},
                {$push:{"data.$.images":meta_data}}
            );
            

            return{message:`thet data is inserted successfully in the ${collection_type}`}
        }
        else if(category === "student_achievements_content"){

        const new_data = Array.isArray(meta_data)?meta_data:[meta_data];

        await mainCollection.updateOne(
          {type:collection_type,"data.category":"student_achievements_content"},
          {$set:{"data.$.content":new_data}}
        )

        return {
          message: `The data is inserted successfully in the ${collection_type}`
        };
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
