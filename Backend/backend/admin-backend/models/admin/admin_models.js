const { getAdminDb } = require("../../config/db");

class AdminModel {
    static async createAdmin(adminData) {
        const db = getAdminDb();
        const collection = db.collection("admins");
        const result = await collection.insertOne(adminData);
        return result;
    }

    static async findByEmail(email) {
        const db = getAdminDb();
        const collection = db.collection("admins");
        return await collection.findOne({ email });
    }
}

module.exports = AdminModel;
