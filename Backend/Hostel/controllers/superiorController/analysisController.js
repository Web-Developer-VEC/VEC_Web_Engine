const { getDb } = require('../../config/db');
const moment = require("moment");
require("moment-timezone");

async function passMeasureSuperior (req, res) {
    try {
        const db = getDb();
        const collection = db.collection("pass_details");
        const warden_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });

        if (!warden_data || !warden_data.profile_years) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const primary_years = warden_data.profile_years;
        if (!Array.isArray(primary_years) || primary_years.length === 0) {
            return res.status(400).json({ error: "Primary years must be an array with at least one value." });
        }

        const currentDate = moment().utc().startOf("day").toDate();
        const nextDate = moment().utc().endOf("day").toDate();
        const now = moment().tz("Asia/Kolkata").toDate();
        const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

        const passTypes = ["od", "outpass", "staypass", "leave"];

        let results = {
            male: {},
            female: {}
        };

        for (const gender of ["Male", "Female"]) {
            let overall = {
                exitTimeNames: [],
                exitTimeCount: 0,
                reEntryTimeNames: [],
                reEntryTimeCount: 0,
                activeOutsideNames: [],
                activeOutsideCount: 0,
                activeOutsidePassTypes: [],
                overdueReturnNames: [],
                overdueReturnCount: 0,
                overdueReturnLateBy: [],
                passTypeNames: {},
                passTypeCounts: {}
            };

            for (const type of passTypes) {
                overall.passTypeNames[type] = [];
                overall.passTypeCounts[type] = 0;
            }

            results[gender] = {};

            for (const year of primary_years) {
                const yearFilter = { year, gender, qrcode_status: true, exit_time: { $ne: null } };

                // Fetch exit time users
                const exitTimeUsers = await collection
                    .find({
                        ...yearFilter,
                        $or: [
                            { from: { $lte: currentDate }, to: { $gte: currentDate } },
                            { from: { $gte: currentDate, $lt: nextDate } },
                        ]
                    })
                    .project({ name: 1, _id: 0 })
                    .toArray();
                const exitTimeNames = exitTimeUsers.map(doc => doc.name);
                const exitTimeCount = exitTimeNames.length;

                // Fetch re-entry time users
                const reEntryTimeUsers = await collection
                    .find({
                        re_entry_time: { $gte: currentDate, $lte: nextDate },
                        ...yearFilter
                    })
                    .project({ name: 1, _id: 0 })
                    .toArray();
                const reEntryTimeNames = reEntryTimeUsers.map(doc => doc.name);
                const reEntryTimeCount = reEntryTimeNames.length;

                // Fetch active outside users
                const activeOutsideList = await collection
                    .find({
                        exit_time: { $exists: true },
                        to: { $gt: istTime },
                        re_entry_time: { $in: [null, ""] },
                        ...yearFilter
                    })
                    .project({ name: 1, passtype: 1, _id: 0 })
                    .toArray();
                const activeOutsideNames = activeOutsideList.map(doc => doc.name);
                const activeOutsidePassTypes = activeOutsideList.map(doc => doc.passtype);
                const activeOutsideCount = activeOutsideNames.length;

                // Fetch overdue return users
                const overdueReturnList = await collection
                    .find({
                        exit_time: { $exists: true },
                        to: { $lt: istTime },
                        re_entry_time: { $in: [null, ""] },
                        ...yearFilter
                    })
                    .project({ name: 1, to: 1, _id: 0 })
                    .toArray();
                const overdueReturnNames = overdueReturnList.map(doc => doc.name);
                const overdueReturnCount = overdueReturnNames.length;
                const overdueReturnLateBy = overdueReturnList.map(doc => {
                    const minutesLate = Math.round((istTime - doc.to) / (1000 * 60));
                    const hours = Math.floor(minutesLate / 60);
                    const minutes = minutesLate % 60;
                    return `${hours} hours ${minutes} minutes`;
                });

                // Fetch pass type users
                let passTypeNames = {};
                let passTypeCounts = {};
                for (const type of passTypes) {
                    passTypeNames[type] = await collection
                        .find({
                            passtype: type,
                            ...yearFilter
                        })
                        .project({ name: 1, _id: 0 })
                        .toArray();
                    passTypeNames[type] = passTypeNames[type].map(doc => doc.name);
                    passTypeCounts[type] = passTypeNames[type].length;

                    overall.passTypeNames[type] = overall.passTypeNames[type].concat(passTypeNames[type]);
                    overall.passTypeCounts[type] += passTypeCounts[type];
                }

                results[gender][year] = {
                    exitTimeNames,
                    exitTimeCount,
                    reEntryTimeNames,
                    reEntryTimeCount,
                    activeOutsideNames,
                    activeOutsidePassTypes,
                    activeOutsideCount,
                    overdueReturnNames,
                    overdueReturnCount,
                    overdueReturnLateBy,
                    passTypeNames,
                    passTypeCounts,
                    currentDate,
                    nextDate,
                    now
                };

                overall.exitTimeNames = overall.exitTimeNames.concat(exitTimeNames);
                overall.exitTimeCount += exitTimeCount;
                overall.reEntryTimeNames = overall.reEntryTimeNames.concat(reEntryTimeNames);
                overall.reEntryTimeCount += reEntryTimeCount;
                overall.activeOutsideNames = overall.activeOutsideNames.concat(activeOutsideNames);
                overall.activeOutsidePassTypes = overall.activeOutsidePassTypes.concat(activeOutsidePassTypes);
                overall.activeOutsideCount += activeOutsideCount;
                overall.overdueReturnNames = overall.overdueReturnNames.concat(overdueReturnNames);
                overall.overdueReturnCount += overdueReturnCount;
                overall.overdueReturnLateBy = overall.overdueReturnLateBy.concat(overdueReturnLateBy);
            }

            results[gender]["overall"] = overall;
        }

        res.json({
            primary_years,
            data: results
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function analysisSuperior (req, res) {
    try {
        const db = getDb();
        const collection = db.collection("pass_details");

        const { type, year, gender} = req.body;
        if (!type) {
            return res.status(400).json({ error: "Missing 'type' parameter in query" });
        }

        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const formattedDate = now.toISOString().split("T")[0];
        const primary_years = ["1", "2", "3", "4"]
        let yearFilter;
        if (["1", "2", "3", "4"].includes(year)) {
            yearFilter = { year: parseInt(year) };
        } else if (year === "overall") {
            yearFilter = { year: { $in: primary_years.map(y => parseInt(y)) } };
        } else {
            return res.status(400).json({ error: "Invalid year value." });
        }

        const commonFilters = {
            passtype: type,
            gender: gender,
            qrcode_status:true,
            ...yearFilter
        };

        const firstMeasureDocs = await collection.find({
            ...commonFilters,
            $or: [
                { from: { $lte: now }, to: { $gte: now } },
                { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
            ]
        }).project({ name: 1, _id: 0 }).toArray();

        const secondMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) }
        }).project({ name: 1, _id: 0 }).toArray();

        const thirdMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $lt: istTime },
            re_entry_time: { $in: [null, ""] }
        }).project({ name: 1, _id: 0 }).toArray();

        const reasonCategories = {
            outpass: ["shopping", "classes", "internship", "medical"],
            staypass: ["holiday", "weekend holiday", "semester holiday", "festival holiday"],
            od: ["internship", "symposium", "sports", "hackathon"],
            leave: ["function", "medical", "exams", "emergency"]
        };
        
        const validReasons = reasonCategories[type.toLowerCase()] || [];
        const fourthMeasureAggregation = await collection.aggregate([
            {
                $match: {
                    ...commonFilters,
                    reason_type: { $exists: true, $ne: null }, // Ensure reason_type exists
                    $or: [
                        { from: { $lte: now }, to: { $gte: now } },
                        { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                        { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: validReasons.length > 0 && { $in: ["$reason_type", validReasons] },
                            then: "$reason_type",
                            else: "Others"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const fourthMeasureCounts = fourthMeasureAggregation.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});        

        res.json({
            activePasses: {
                count: firstMeasureDocs.length,
                names: firstMeasureDocs.map(doc => doc.name)
            },
            toFieldMatch: {
                count: secondMeasureDocs.length,
                names: secondMeasureDocs.map(doc => doc.name)
            },
            overduePasses: {
                count: thirdMeasureDocs.length,
                names: thirdMeasureDocs.map(doc => doc.name)
            },
            reasonTypeCounts: fourthMeasureCounts,
            now
        });

    } catch (error) {
        console.error("Error fetching pass analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function analysisSuperior_date (req, res) {
    try {
        const db = getDb();
        const collection = db.collection("pass_details");

        const { type, year,date, gender } = req.body;
        if (!type) {
            return res.status(400).json({ error: "Missing 'type' parameter in query" });
        }

        const now = new Date(`${date}T00:00:00.000Z`);
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const formattedDate = now.toISOString().split("T")[0];
        const primary_years = ["1", "2", "3", "4"]


        let yearFilter;
        if (["1", "2", "3", "4"].includes(year)) {
            yearFilter = { year: parseInt(year) };
        } else if (year === "overall") {
            yearFilter = { year: { $in: primary_years.map(y => parseInt(y)) } };
        } else {
            return res.status(400).json({ error: "Invalid year value." });
        }

        const commonFilters = {
            passtype: type,
            gender: gender,
            qrcode_status:true,
            ...yearFilter
        };
        const firstMeasureDocs = await collection.find({
            ...commonFilters,
            $or: [
                { from: { $lte: now }, to: { $gte: now } },
                { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
            ]
        }).project({ name: 1, _id: 0 }).toArray();
        const secondMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) }
        }).project({ name: 1, _id: 0 }).toArray();
        const thirdMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $lt: istTime },
            re_entry_time: { $in: [null, ""] }
        }).project({ name: 1, _id: 0 }).toArray();
        const reasonCategories = {
            outpass: ["shopping", "classes", "internship", "medical"],
            staypass: ["holiday", "weekend holiday", "semester holiday", "festival holiday"],
            od: ["internship", "symposium", "sports", "hackathon"],
            leave: ["function", "medical", "exams", "emergency"]
        };
        
        const validReasons = reasonCategories[type.toLowerCase()] || [];
        const fourthMeasureAggregation = await collection.aggregate([
            {
                $match: {
                    ...commonFilters,
                    reason_for_visit: { $exists: true, $ne: null },
                    $or: [
                        { from: { $lte: now }, to: { $gte: now } },
                        { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                        { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $in: ["$reason_type", validReasons] },
                            then: "$reason_type",
                            else: "Others"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        const fourthMeasureCounts = fourthMeasureAggregation.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});        

        res.json({
            activePasses: {
                count: firstMeasureDocs.length,
                names: firstMeasureDocs.map(doc => doc.name)
            },
            toFieldMatch: {
                count: secondMeasureDocs.length,
                names: secondMeasureDocs.map(doc => doc.name)
            },
            overduePasses: {
                count: thirdMeasureDocs.length,
                names: thirdMeasureDocs.map(doc => doc.name)
            },
            reasonTypeCounts: fourthMeasureCounts,
            now,
            formattedDate,
            istTime
        });

    } catch (error) {
        console.error("Error fetching pass analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    passMeasureSuperior,
    analysisSuperior,
    analysisSuperior_date
}