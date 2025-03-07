const { getDb } = require('../../config/db');
const moment = require("moment");
require("moment-timezone");

async function passMeasureWarden (req, res) {
    try {
        const db = getDb();
        const collection = db.collection("pass_details");
        const warden_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });

        if (!warden_data || !warden_data.primary_year) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const warden_handling_gender = warden_data.gender;
        const primary_years = warden_data.primary_year;
        if (!Array.isArray(primary_years) || primary_years.length === 0) {
            return res.status(400).json({ error: "Primary years must be an array with at least one value." });
        }

        const currentDate = moment().utc().startOf("day").toDate();
        const nextDate = moment().utc().endOf("day").toDate();
        const now = moment().tz("Asia/Kolkata").toDate();
        const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

        const passTypes = ["od", "outpass", "staypass", "leave"];

        let results = {};
        let overall = {
            exitTimeCount: 0,
            reEntryTimeCount: 0,
            activeOutsideCount: 0,
            overdueReturnCount: 0,
            activeOutsideDetails: { names: [], passtypes: [] },  // ✅ Added
            overdueReturnDetails: { names: [], late_by: [] },  // ✅ Added
            passTypeCounts: {}
        };

        for (const type of passTypes) {
            overall.passTypeCounts[type] = { count: 0, names: [] };
        }

        for (const year of primary_years) {
            const yearFilter = { year, gender: warden_handling_gender, qrcode_status: true, exit_time: { $ne: null } };

            // Measure 1: Exit Time Count
            const exitTimeData = await collection.find({
                ...yearFilter,
                $or: [
                    { from: { $lte: currentDate }, to: { $gte: currentDate } },
                    { from: { $gte: currentDate, $lt: nextDate } },
                    { to: { $gte: currentDate, $lt: nextDate } }
                ]
            }).project({ name: 1, _id: 0 }).toArray();
            const exitTimeCount = exitTimeData.length;

            // Measure 2: Re-entry Time Count
            const reEntryTimeData = await collection.find({
                re_entry_time: { $gte: currentDate, $lt: nextDate },
                ...yearFilter
            }).project({ name: 1, _id: 0 }).toArray();
            const reEntryTimeCount = reEntryTimeData.length;

            // Measure 3: Active Outside Count (with passtype)
            const activeOutsideData = await collection.find({
                exit_time: { $exists: true },
                to: { $gt: istTime },
                re_entry_time: { $in: [null, ""] },
                ...yearFilter
            }).project({ name: 1, passtype: 1, _id: 0 }).toArray();
            const activeOutsideCount = activeOutsideData.length;
            const activeOutsideDetails = {
                names: activeOutsideData.map(p => p.name),
                passtypes: activeOutsideData.map(p => p.passtype)
            };

            // Measure 4: Overdue Return Count (with late_by)
            const overdueReturnData = await collection.find({
                exit_time: { $exists: true },
                to: { $lt: istTime },
                re_entry_time: { $in: [null, ""] },
                ...yearFilter
            }).project({ name: 1, to: 1, _id: 0 }).toArray();
            const overdueReturnCount = overdueReturnData.length;

            // Calculate late_by (hours and minutes)
            const overdueReturnProcessed = {
                names: overdueReturnData.map(entry => entry.name),
                late_by: overdueReturnData.map(entry => {
                    const toTime = new Date(entry.to);
                    const lateByMs = istTime - toTime;
                    const lateHours = Math.floor(lateByMs / (1000 * 60 * 60));
                    const lateMinutes = Math.floor((lateByMs % (1000 * 60 * 60)) / (1000 * 60));

                    return `${lateHours} hours ${lateMinutes} minutes`;
                })
            };

            let passTypeCounts = {};
            for (const type of passTypes) {
                const passData = await collection.find({
                    passtype: type,
                    ...yearFilter
                }).project({ name: 1, _id: 0 }).toArray();
                passTypeCounts[type] = { count: passData.length, names: passData.map(p => p.name) };

                overall.passTypeCounts[type].count += passData.length;
                overall.passTypeCounts[type].names.push(...passData.map(p => p.name));
            }

            results[year] = {
                exitTimeCount,
                exitTimeDetails: { names: exitTimeData.map(p => p.name) },
                reEntryTimeCount,
                reEntryTimeDetails: { names: reEntryTimeData.map(p => p.name) },
                activeOutsideCount,
                activeOutsideDetails,
                overdueReturnCount,
                overdueReturnDetails: overdueReturnProcessed,
                passTypeCounts,
                currentDate,
                nextDate,
                now,
                istTime
            };

            overall.exitTimeCount += exitTimeCount;
            overall.reEntryTimeCount += reEntryTimeCount;
            overall.activeOutsideCount += activeOutsideCount;
            overall.overdueReturnCount += overdueReturnCount;
            
            // ✅ Append Active Outside details to overall section
            overall.activeOutsideDetails.names.push(...activeOutsideDetails.names);
            overall.activeOutsideDetails.passtypes.push(...activeOutsideDetails.passtypes);

            // ✅ Append Overdue Return details to overall section
            overall.overdueReturnDetails.names.push(...overdueReturnProcessed.names);
            overall.overdueReturnDetails.late_by.push(...overdueReturnProcessed.late_by);
        }

        results["overall"] = overall;

        res.json({
            primary_years,
            data: results
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function analysisWarden (req, res) {
    try {
        const db = getDb();
        const collection = db.collection("pass_details");

        const { type, year } = req.body;
        if (!type) {
            return res.status(400).json({ error: "Missing 'type' parameter in query" });
        }
        

        const warden_id=req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });

        if (!warden_data || !warden_data.primary_year) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const warden_handling_gender = warden_data.gender;
        const primary_years = warden_data.primary_year;
        if (!Array.isArray(primary_years) || primary_years.length === 0) {
            return res.status(400).json({ error: "Primary years must be an array with at least one value." });
        }

        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const formattedDate = now.toISOString().split("T")[0];

        let yearFilter;
        if (["1", "2", "3", "4"].includes(year)) {
            yearFilter = { year: parseInt(year) };
        } else if (year === "overall") {
            yearFilter = { year: { $in: primary_years } };
        } else {
            return res.status(400).json({ error: "Invalid year value." });
        }

        const commonFilters = {
            passtype: type,
            gender: warden_handling_gender,
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
            now
        });

    } catch (error) {
        console.error("Error fetching pass analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function analysisWarden_date (req, res) {
    try {
        const db = getDb();
        const collection = db.collection("pass_details");

        const { type, year,date } = req.body;
        if (!type) {
            return res.status(400).json({ error: "Missing 'type' parameter in query" });
        }
        

        const warden_id=req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });

        if (!warden_data || !warden_data.primary_year) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const warden_handling_gender = warden_data.gender;
        const primary_years = warden_data.primary_year;
        if (!Array.isArray(primary_years) || primary_years.length === 0) {
            return res.status(400).json({ error: "Primary years must be an array with at least one value." });
        }

        const now = new Date(`${date}T00:00:00.000Z`);
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const formattedDate = now.toISOString().split("T")[0];

        let yearFilter;
        if (["1", "2", "3", "4"].includes(year)) {
            yearFilter = { year: parseInt(year) };
        } else if (year === "overall") {
            yearFilter = { year: { $in: primary_years } };
        } else {
            return res.status(400).json({ error: "Invalid year value." });
        }

        const commonFilters = {
            passtype: type,
            gender: warden_handling_gender,
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
            reasonTypeCounts: fourthMeasureCounts
        });

    } catch (error) {
        console.error("Error fetching pass analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    passMeasureWarden,
    analysisWarden,
    analysisWarden_date
}