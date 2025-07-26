const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const verifyAdminAccess = require('../../middlewares/verifyAdminAccess');
const db = require('../../config/db'); // Adjust path if needed

// Update landing page details
router.post('/update_landing_page_details', verifyAdminAccess('landing_page_access'), async (req, res) => {
    try {
        const { metadata, collection, category, type, title } = req.body;
        const admin_id = req.session.username;

        if (!metadata || !collection || !type || !title || !category) {
            return res.status(400).json({ error: 'Missing required fields in request body' });
        }

        const dbCollection = db.collection(collection);
        const existingDoc = await dbCollection.findOne({});

        if (!existingDoc || !existingDoc.landing_page_details) {
            return res.status(404).json({ error: 'Landing page details not found' });
        }

        const originalLandingPageDetails = existingDoc.landing_page_details;

        const originalFields = {};
        for (const key in metadata) {
            originalFields[key] = originalLandingPageDetails[key] ?? null;
        }

        const tempDoc = {
            unique_id: uuidv4(),
            action_target_id: existingDoc._id,
            metadata: { landing_page_details: metadata },
            original_data: { landing_page_details: originalFields },
            type,
            collection_name: collection,
            category,
            admin_id,
            title,
            status: 'pending',
            date: new Date().toISOString(),
            reviewed_by: null,
            reviewed_notes: null
        };

        await db.collection('temp').insertOne(tempDoc);

        return res.status(200).json({
            message: 'Landing page update request submitted for approval',
            request_id: tempDoc.unique_id,
            changes: metadata
        });

    } catch (err) {
        console.error('Error updating landing page:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Review landing page request
router.post('/review_landing_page_request', verifyAdminAccess('landing_page_access'), async (req, res) => {
    try {
        const { unique_id, reviewed_notes, actions } = req.body;

        if (!unique_id || !actions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tempCollection = db.collection('temp');
        const landingPageCollection = db.collection('landing_page_details');
        const adminArchiveCollection = db.collection('admin_archive');

        const requestDoc = await tempCollection.findOne({ unique_id });
        if (!requestDoc) return res.status(404).json({ error: 'Request not found' });

        const { metadata, action_target_id } = requestDoc;

        const approvedUpdates = {};
        const rejectedFields = [];

        for (const section in actions) {
            if (!metadata[section]) continue;

            for (const field in actions[section]) {
                const decision = actions[section][field];
                const value = metadata[section][field];

                if (decision === 'approve') {
                    approvedUpdates[`${section}.${field}`] = value;
                } else if (decision === 'reject') {
                    rejectedFields.push(`${section}.${field}`);
                }
            }
        }

        let updateStatus = 'rejected';

        if (Object.keys(approvedUpdates).length > 0) {
            await landingPageCollection.updateOne(
                { _id: new ObjectId(action_target_id) },
                { $set: approvedUpdates }
            );
            updateStatus = rejectedFields.length === 0 ? 'approved' : 'partially_approved';
        }

        const updatedRequest = {
            ...requestDoc,
            reviewed_by: req.session.username,
            reviewed_notes: reviewed_notes || '',
            status: 'managed',
            actions
        };

        await tempCollection.updateOne(
            { unique_id },
            { $set: { reviewed_by: req.session.username, reviewed_notes, status: 'managed', actions } }
        );

        await adminArchiveCollection.insertOne(updatedRequest);
        await tempCollection.deleteOne({ unique_id });

        return res.status(200).json({
            message: `Request ${updateStatus.replace('_', ' ')} and archived successfully.`,
            approved_fields: approvedUpdates,
            rejected_fields: rejectedFields
        });

    } catch (err) {
        console.error('Error processing landing page request review:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
