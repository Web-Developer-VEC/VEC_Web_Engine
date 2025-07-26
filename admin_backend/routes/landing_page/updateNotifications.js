const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const { db } = require('../../config/db');
const verifyAdminAccess = require('../../middlewares/verifyAdminAccess');

// Utility: Validate and fetch notification from DB
async function getNotificationById(dbCollection, existing_id) {
    const doc = await dbCollection.findOne({});
    if (!doc || !Array.isArray(doc.notifications)) {
        throw { status: 500, message: 'Notifications array is missing in document' };
    }
    if (doc.notifications.length === 0) {
        throw { status: 404, message: 'No notifications found in document' };
    }
    const match = doc.notifications.find(n => n.id === existing_id);
    if (!match) {
        throw { status: 404, message: 'Notification not found in document' };
    }
    return { doc, match };
}

// Utility: Sanitize metadata
function sanitizeMetadata(metadata) {
    const allowedFields = ['id', 'message', 'status', 'created_at'];
    return Object.fromEntries(
        Object.entries(metadata).filter(([key]) => allowedFields.includes(key))
    );
}

// Admin Update Notifications
router.post('/api/update_notifications', verifyAdminAccess('landing_page_access'), async (req, res) => {
    try {
        const { title, type, existing_id, metadata } = req.body;
        const admin_id = req.session.username;

        if (!title || !type || (type !== 'add' && !existing_id) || (type !== 'delete' && !metadata)) {
            return res.status(400).json({ error: 'Missing required fields in request body' });
        }

        const dbCollection = db.collection('landing_page_details');
        const TempCollection = db.collection('temp');

        if (type === 'add') {
            const sanitizedMetadata = sanitizeMetadata(metadata);

            const DocStructure = {
                unique_id: uuidv4(),
                action_target_id: null,
                existing_id: null,
                metadata: { notifications: sanitizedMetadata },
                original_data: { notifications: null },
                type,
                collection_name: 'landing_page_details',
                category: 'notifications',
                admin_id,
                title,
                status: 'pending',
                date: new Date().toISOString(),
                reviewed_by: null,
                reviewed_notes: null
            };

            await TempCollection.insertOne(DocStructure);
            return res.status(200).json({
                message: 'Notifications add request submitted for approval',
                request_id: DocStructure.unique_id,
                changes: sanitizedMetadata
            });
        }

        let existingDoc, matchedNotification;
        try {
            const result = await getNotificationById(dbCollection, existing_id);
            existingDoc = result.doc;
            matchedNotification = result.match;
        } catch (err) {
            return res.status(err.status || 500).json({ error: err.message });
        }

        if (type === 'update') {
            const sanitizedMetadata = sanitizeMetadata(metadata);

            if (sanitizedMetadata.id && sanitizedMetadata.id !== existing_id) {
                return res.status(400).json({ error: 'Cannot change notification ID' });
            }

            const FieldsToUpdate = {};
            for (const key in sanitizedMetadata) {
                FieldsToUpdate[key] = matchedNotification[key] ?? null;
            }

            const DocStructure = {
                unique_id: uuidv4(),
                action_target_id: existingDoc._id,
                existing_id,
                metadata: { notifications: sanitizedMetadata },
                original_data: { notifications: FieldsToUpdate },
                type,
                collection_name: 'landing_page_details',
                category: 'notifications',
                admin_id,
                title,
                status: 'pending',
                date: new Date().toISOString(),
                reviewed_by: null,
                reviewed_notes: null
            };

            await TempCollection.insertOne(DocStructure);
            return res.status(200).json({
                message: 'Notifications update request submitted for approval',
                request_id: DocStructure.unique_id,
                changes: sanitizedMetadata
            });
        }

        if (type === 'delete') {
            const DocStructure = {
                unique_id: uuidv4(),
                action_target_id: existingDoc._id,
                existing_id,
                metadata: { notifications: null },
                original_data: { notifications: matchedNotification },
                type,
                collection_name: 'landing_page_details',
                category: 'notifications',
                admin_id,
                title,
                status: 'pending',
                date: new Date().toISOString(),
                reviewed_by: null,
                reviewed_notes: null
            };

            await TempCollection.insertOne(DocStructure);
            return res.status(200).json({
                message: 'Notifications delete request submitted for approval',
                request_id: DocStructure.unique_id,
                changes: matchedNotification
            });
        }

        return res.status(400).json({ error: 'Invalid type specified. Must be "add", "update", or "delete"' });

    } catch (err) {
        console.error('Error queuing notifications update:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Superior Admin Review for notifications
router.post('/api/review_notifications_request', verifyAdminAccess('landing_page_access'), async (req, res) => {
    try {
        const { unique_id, reviewed_notes, actions } = req.body;
        if (!unique_id || !actions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tempCollection = db.collection('temp');
        const landingPageCollection = db.collection('landing_page_details');
        const adminArchiveCollection = db.collection('admin_archive');
        const username = req.session.username;

        const requestDoc = await tempCollection.findOne({ unique_id });
        if (!requestDoc) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const { type, metadata, original_data , existing_id } = requestDoc;
        const section = 'notifications';
        const sectionData = metadata?.[section];
        const sectionActions = actions?.[section];

        if (!sectionData && type !== 'delete') {
            return res.status(400).json({ error: 'Missing notifications metadata' });
        }
        if (!sectionActions) {
            return res.status(400).json({ error: 'Missing actions for notifications' });
        }

        let results = [];
        let finalStatus = 'rejected';
        const approvedFields = {};
        const rejectedFields = [];

        if (type === 'add') {
            const approvedNotification = {};
            for (const field in sectionActions) {
                if (sectionActions[field] === 'approve') {
                    approvedNotification[field] = sectionData[field];
                } else {
                    rejectedFields.push(`${section}.${field}`);
                }
            }

            if (Object.keys(approvedNotification).length > 0) {
                const newnotification = {
                    id: uuidv4(),
                    message: approvedNotification.message || '',
                    status: 'active',
                    created_at: new Date().toISOString()
                };

                await landingPageCollection.updateOne({}, {
                    $push: { notifications: newnotification }
                });

                approvedFields[section] = approvedNotification;
                finalStatus = rejectedFields.length === 0 ? 'approved' : 'partially_approved';
            }

        } else if (type === 'update') {
            const notificationId = existing_id;

            if (!notificationId) {
                return res.status(400).json({ error: 'Notification ID is required for update' });
            }

            const doc = await landingPageCollection.findOne({});
            const notifications = doc?.notifications || [];
            const notificationIndex = notifications.findIndex(n => n.id === notificationId);

            if (notificationIndex === -1) {
                return res.status(404).json({ error: 'Matching notification not found in live data' });
            }

            const updates = {};
            for (const field in sectionActions) {
                if (sectionActions[field] === 'approve') {
                    updates[`notifications.${notificationIndex}.${field}`] = sectionData[field];
                } else {
                    rejectedFields.push(`${section}.${field}`);
                }
            }

            if (Object.keys(updates).length > 0) {
                await landingPageCollection.updateOne({}, { $set: updates });
                approvedFields[section] = updates;
                finalStatus = rejectedFields.length === 0 ? 'approved' : 'partially_approved';
            }

        } else if (type === 'delete') {
            if (sectionActions.delete_notification === 'approve') {
                const notificationId = existing_id;

                if (!notificationId) {
                    return res.status(400).json({ error: 'Notification ID is required for delete' });
                }

                await landingPageCollection.updateOne({}, {
                    $pull: { notifications: { id: notificationId } }
                });

                approvedFields[section] = { delete_notification: notificationId };
                finalStatus = 'approved';
            } else {
                rejectedFields.push('notifications.delete_notification');
            }

        } else {
            return res.status(400).json({ error: 'Unknown request type' });
        }

        // Archive the decision
        const archiveDoc = {
            ...requestDoc,
            reviewed_by: username,
            reviewed_notes: reviewed_notes || '',
            status: 'managed',
            actions
        };

        await adminArchiveCollection.insertOne(archiveDoc);
        await tempCollection.deleteOne({ unique_id });

        results.push({
            unique_id,
            status: finalStatus,
            approved_fields: approvedFields,
            rejected_fields: rejectedFields
        });

        return res.status(200).json({
            message: 'Review process completed',
            results
        });

    } catch (err) {
        console.error('Error reviewing notifications requests:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;