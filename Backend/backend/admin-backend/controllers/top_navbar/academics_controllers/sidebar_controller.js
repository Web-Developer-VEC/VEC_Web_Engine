const { getDb } = require("../../../../main-backend/config/db");


async function updateDepartmentSidebar(deptCollectionName, changedType) {
    const db = getDb();
    const deptCollection = db.collection(deptCollectionName);

    const reverseMap = {
        hod: "HeadDepartment",
        vision_and_mission: "Vision&Mission",
        faculty: "Faculties",
        activities: "Activities",
        pedagogy: "Pedagogy",
        curriculum_and_syllabus: "Syllabus",
        infrastructure: "Infrastructure",
        student_achievements: "StudentAchievments",
        mous: "Mous",
        research: "Research",
        newsletter: "NewsLetter",
        eventorg: "Event Organizer",
    };

    const sidebarId = reverseMap[changedType];

    if (!sidebarId) return;

    const doc = await deptCollection.findOne(
        { type: changedType },
        { projection: { data: 1 } }
    );

    let hascontent = false;

    if (doc && Array.isArray(doc.data)) {
        const sections = doc.data.filter(
            s => s.category !== "banner_name_and_image"
        );

        hascontent =
            sections.length === 0 ||
            sections.some(section =>
                Object.entries(section).some(([key, value]) => {
                    if (key === "category") return false;

                    if (Array.isArray(value)) return value.length > 0;

                    if (typeof value === "string")
                        return value.trim() !== "";

                    return false;
                })
            );
    }

    await deptCollection.updateOne(
        {
            type: "sidebar",
            "content.id": sidebarId,
        },
        {
            $set: {
                "content.$.hascontent": hascontent,
            },
        }
    );
    return {
        success: true,
        sidebarId,
        hascontent
    };
}
async function updateData(tempDoc, mainCollection) {
    const { collection_type, meta_data } = tempDoc;

    if (collection_type !== "sidebar") {
        throw new Error("Incorrect collection type");
    }

    const items = Array.isArray(meta_data.content)
        ? meta_data.content
        : [meta_data];

    for (const item of items) {
        await mainCollection.updateOne(
            {
                type: "sidebar",
                "content.id": item.id,
            },
            {
                $set: {
                    "content.$.hascontent": item.hascontent,
                },
            }
        );
    }

    return {
        success: true,
        message: "Sidebar updated successfully",
    };
}

module.exports = { updateDepartmentSidebar, updateData };