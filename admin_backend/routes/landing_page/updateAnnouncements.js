const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const path = require('path');

const { db } = require('../../config/db');
const verifyAdminAccess = require('../../middlewares/verifyAdminAccess');
const {
  setUploadDestinationKey,
  getMulterUploadFromRequest
} = require('../../config/multer');
const { BASE_UPLOAD_PATH, STATIC_PATHS } = require('../../config/paths');

router.post(
  '/api/update_announcements',
  setUploadDestinationKey('announcements_pdf'),
  (req, res, next) => {
    // Optional custom filename
    next();
  },
  getMulterUploadFromRequest('pdf_path'),
  verifyAdminAccess('landing_page_access'),

  async (req, res) => {
    try {
      const { title, type, existing_id } = req.body;
      const metadata = typeof req.body.metadata === 'string' ? JSON.parse(req.body.metadata) : req.body.metadata;
      const admin_id = req.session.username;

      if (!type || !['add', 'update', 'delete'].includes(type)) {
        return res.status(400).json({ error: 'Invalid or missing type specified' });
      }

      const announcementsCollection = db.collection('announcements');
      const TempCollection = db.collection('temp');

      if (type === 'add') {
        if (!req.file) {
          return res.status(400).json({ error: 'PDF file is required for adding announcement' });
        }

        const pdf_path = path.posix.join(BASE_UPLOAD_PATH, STATIC_PATHS[req.destinationKey], req.file.filename);
        const newAnnouncement = { pdf_path, ...metadata };

        const tempDoc = {
          unique_id: uuidv4(),
          action_target_id: null,
          existing_id: null,
          metadata: { announcements: newAnnouncement },
          original_data: { announcements: null },
          type,
          collection_name: 'announcements',
          category: 'announcement',
          admin_id,
          title,
          status: 'pending',
          date: new Date().toISOString(),
          reviewed_by: null,
          reviewed_notes: null
        };

        await TempCollection.insertOne(tempDoc);

        return res.status(200).json({
          message: 'Announcement add request submitted for approval',
          request_id: tempDoc.unique_id,
          announcement_preview: newAnnouncement
        });
      }

      if (type === 'update') {
        const existingDoc = await announcementsCollection.findOne({ _id: new ObjectId(existing_id) });
        if (!existingDoc) {
          return res.status(404).json({ error: 'Announcement not found' });
        }

        const originalFields = {};
        for (const key in metadata) {
          originalFields[key] = existingDoc[key] ?? null;
        }

        if (req.file) {
          if (!req.file.originalname.toLowerCase().endsWith('.pdf')) {
            return res.status(400).json({ error: 'Only PDF files are allowed' });
          }

          metadata.pdf_path = path.posix.join(BASE_UPLOAD_PATH, STATIC_PATHS[req.destinationKey], req.file.filename);
          originalFields.pdf_path = existingDoc.pdf_path ?? null;
        }

        const tempDoc = {
          unique_id: uuidv4(),
          action_target_id: existingDoc._id,
          existing_id,
          metadata: { announcements: metadata },
          original_data: { announcements: originalFields },
          type,
          collection_name: 'announcements',
          category: 'announcement',
          admin_id,
          title,
          status: 'pending',
          date: new Date().toISOString(),
          reviewed_by: null,
          reviewed_notes: null
        };

        await TempCollection.insertOne(tempDoc);

        return res.status(200).json({
          message: 'Announcement update request submitted for approval',
          request_id: tempDoc.unique_id,
          announcement_preview: metadata
        });
      }

      if (type === 'delete') {
        if (!ObjectId.isValid(existing_id)) {
          return res.status(400).json({ error: 'Invalid existing_id format' });
        }

        const existingDoc = await announcementsCollection.findOne({ _id: new ObjectId(existing_id) });
        if (!existingDoc) {
          return res.status(404).json({ error: 'Announcement not found' });
        }

        const tempDoc = {
          unique_id: uuidv4(),
          action_target_id: existingDoc._id,
          existing_id,
          metadata: { announcements: null },
          original_data: { announcements: existingDoc },
          type,
          collection_name: 'announcements',
          category: 'announcement',
          admin_id,
          title,
          status: 'pending',
          date: new Date().toISOString(),
          reviewed_by: null,
          reviewed_notes: null
        };

        await TempCollection.insertOne(tempDoc);

        return res.status(200).json({
          message: 'Announcement delete request submitted for approval',
          request_id: tempDoc.unique_id,
          deleted_announcement: existingDoc
        });
      }

    } catch (err) {
      console.error('Error updating announcements:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
