async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }

  if (collection_type !== "activities") {
    throw new Error("Incorrect collection type or route");
  }

  const doc = await mainCollection.findOne({ type: collection_type });

  // Default activities
  const defaultActivities = [
    { name: "Guest Lecture", pdf_path: "" },
    { name: "Seminar", pdf_path: "" },
    { name: "Workshop", pdf_path: "" },
    { name: "Industrial Visit/ In-Plant Training", pdf_path: "" },
    { name: "Internship", pdf_path: "" },
    { name: "Symposium", pdf_path: "" },
    { name: "Conference", pdf_path: "" },
    { name: "Value Added Course", pdf_path: "" },
  ];

  // Merge uploaded pdf(s) into default activities
  const buildActivitiesTile = () => {
    const activities = structuredClone(defaultActivities);

    for (const incoming of meta_data.activities_tile || []) {
      const activity = activities.find(
        (a) => a.name === incoming.name
      );

      if (activity) {
        activity.pdf_path = incoming.pdf_path;
      }
    }

    return activities;
  };

  const categoryExist = doc?.data.find(
    (c) => c.category === category
  );

  // -----------------------
  // CATEGORY DOESN'T EXIST
  // -----------------------
  if (!categoryExist) {
    await mainCollection.updateOne(
      { type: collection_type },
      {
        $push: {
          data: {
            category,
            content: [
              {
                year: meta_data.year,
                activities_tile: buildActivitiesTile(),
              },
            ],
          },
        },
      }
    );

    return {
      success: true,
      message: `Category ${category} created successfully`,
    };
  }

  const yearExist = categoryExist.content.find(
    (c) => c.year === meta_data.year
  );

  // -----------------------
  // YEAR DOESN'T EXIST
  // -----------------------
  if (!yearExist) {
    await mainCollection.updateOne(
      {
        type: collection_type,
        "data.category": category,
      },
      {
        $push: {
          "data.$.content": {
            year: meta_data.year,
            activities_tile: buildActivitiesTile(),
          },
        },
      }
    );

    return {
      success: true,
      message: "New year inserted successfully",
    };
  }

  // -----------------------
  // YEAR EXISTS -> UPDATE
  // -----------------------
  const uploadedActivity = meta_data.activities_tile.find(
    (a) => a.pdf_path
  );

  if (!uploadedActivity) {
    throw new Error("No uploaded activity found");
  }

  await mainCollection.updateOne(
    {
      type: collection_type,
      "data.category": category,
    },
    {
      $set: {
        "data.$.content.$[year].activities_tile.$[activity].pdf_path":
          uploadedActivity.pdf_path,
      },
    },
    {
      arrayFilters: [
        { "year.year": meta_data.year },
        { "activity.name": uploadedActivity.name },
      ],
    }
  );

  return {
    success: true,
    message: "Activity updated successfully",
  };
}

module.exports = { insertData };