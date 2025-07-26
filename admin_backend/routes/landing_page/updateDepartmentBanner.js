const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const db = require('../../config/db');
const verifyAdminAccess = require('../../middlewares/verifyAdminAccess');
const { uploadFileToS3FromPath } = require('../../utils/uploadToS3');
const {
  setUploadDestinationKey,
  getMulterUploadFromRequest
} = require('../../config/multer');
const { BASE_UPLOAD_PATH, STATIC_PATHS } = require('../../config/paths');

// Update Department Banner Request (Admin)
router.post(
  '/update_department_banner',
  setUploadDestinationKey('department_banner_image'),
  async (req, res, next) => {
    try {
      const { type, existing_id } = req.body;
      const collection = db.collection('landing_page_details');
      const existingDoc = await collection.findOne({});
      if (!existingDoc) return res.status(404).json({ error: 'Landing page document not found' });

      const departmentBanners = existingDoc.department_banner || [];

      if (type === 'add') {
        const newIndex = departmentBanners.length + 1;
        req.filename = String(newIndex).padStart(3, '0');
      } else if (type === 'update') {
        const idx = departmentBanners.findIndex(b => b.dept === existing_id);
        if (idx === -1) return res.status(404).json({ error: 'Department banner not found' });
        const existingPath = departmentBanners[idx].banner_image;
        req.filename = path.basename(existingPath, path.extname(existingPath));
      } else if (type === 'delete') {
        return next();
      } else {
        return res.status(400).json({ error: 'Invalid type specified' });
      }

      next();
    } catch (err) {
      console.error('Pre-upload logic failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  getMulterUploadFromRequest('banner_image'),
  verifyAdminAccess('landing_page_access'),
  async (req, res) => {
    try {
      const { metadata, type, title, existing_id } = req.body;
      const admin_id = req.session.username;
      const parsedMeta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

      const landingPageCol = db.collection('landing_page_details');
      const tempCol = db.collection('temp');
      const existingDoc = await landingPageCol.findOne({});
      if (!existingDoc) return res.status(404).json({ error: 'Landing page document not found' });

      const banners = existingDoc.department_banner || [];

      if (type === 'add') {
        if (!req.file) return res.status(400).json({ error: 'Banner image file is required' });

        const paddedIndex = req.filename;
        const relativePath = path.posix.join(STATIC_PATHS.department_banner_image, req.file.filename);
        const bannerImagePath = `/static/${relativePath}`;
        const redirect_url = `/dept/${paddedIndex}`;

        const newBanner = {
          ...parsedMeta,
          banner_image: bannerImagePath,
          redirect_url
        };

        const tempDoc = {
          unique_id: uuidv4(),
          action_target_id: null,
          metadata: { department_banner: newBanner },
          original_data: { department_banner: null },
          type,
          collection_name: 'landing_page_details',
          category: 'department_banner',
          admin_id,
          title,
          status: 'pending',
          date: new Date().toISOString(),
          reviewed_by: null,
          reviewed_notes: null
        };

        await tempCol.insertOne(tempDoc);
        return res.status(200).json({
          message: 'Department banner add request submitted for approval',
          request_id: tempDoc.unique_id,
          banner_preview: newBanner
        });

      } else if (type === 'update') {
        const idx = banners.findIndex(b => b.dept === existing_id);
        if (idx === -1) return res.status(404).json({ error: 'Banner not found' });

        const existingBanner = banners[idx];
        const originalFields = {};
        for (const key in parsedMeta) {
          originalFields[key] = existingBanner[key] ?? null;
        }

        if (req.file) {
          const relativePath = path.posix.join(STATIC_PATHS.department_banner_image, req.file.filename);
          parsedMeta.banner_image = `/static/${relativePath}`;
        }

        const tempDoc = {
          unique_id: uuidv4(),
          action_target_id: existingDoc._id,
          metadata: { department_banner: parsedMeta },
          original_data: { department_banner: originalFields },
          type,
          collection_name: 'landing_page_details',
          category: 'department_banner',
          admin_id,
          title,
          status: 'pending',
          date: new Date().toISOString(),
          reviewed_by: null,
          reviewed_notes: null
        };

        await tempCol.insertOne(tempDoc);
        return res.status(200).json({
          message: 'Department banner update request submitted for approval',
          request_id: tempDoc.unique_id,
          banner_preview: parsedMeta
        });

      } else if (type === 'delete') {
        const bannerToDelete = banners.find(b => b.dept === existing_id);
        if (!bannerToDelete) return res.status(404).json({ error: 'Banner not found' });

        const tempDoc = {
          unique_id: uuidv4(),
          action_target_id: existingDoc._id,
          metadata: {},
          original_data: { department_banner: bannerToDelete },
          type,
          collection_name: 'landing_page_details',
          category: 'department_banner',
          admin_id,
          title,
          status: 'pending',
          date: new Date().toISOString(),
          reviewed_by: null,
          reviewed_notes: null
        };

        await tempCol.insertOne(tempDoc);
        return res.status(200).json({
          message: 'Department banner delete request submitted for approval',
          request_id: tempDoc.unique_id,
          deleted_banner: bannerToDelete
        });
      }

      return res.status(400).json({ error: 'Invalid type' });

    } catch (err) {
      console.error('Error processing department banner request:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);


// Superior Admin Review
router.post('/review_department_banner_request', verifyAdminAccess('landing_page_access'), async (req, res) => {
  try {
    const payload = req.body.superior_payload;
    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty superior_payload' });
    }

    const tempCollection = db.collection('temp');
    const landingPageCollection = db.collection('landing_page_details');
    const adminArchiveCollection = db.collection('admin_archive');
    const username = req.session.username;

    const results = [];

    for (const review of payload) {
      const { unique_id, reviewed_notes, actions } = review;
      const requestDoc = await tempCollection.findOne({ unique_id });

      if (!requestDoc) {
        results.push({ unique_id, status: 'failed', reason: 'Request not found' });
        continue;
      }

      const { type, metadata, original_data, action_target_id } = requestDoc;
      let finalStatus = 'rejected';
      const approvedFields = {};
      const rejectedFields = [];

      if (type === 'add' || type === 'update') {
        const section = 'department_banner';
        const sectionData = metadata[section];
        const sectionActions = actions[section];

        if (type === 'update') {
          const deptToUpdate = original_data[section]?.dept;
          const doc = await landingPageCollection.findOne({});
          const banners = doc?.department_banner || [];
          const bannerIndex = banners.findIndex(b => b.dept === deptToUpdate);
          if (bannerIndex === -1) {
            results.push({ unique_id, status: 'failed', reason: 'Department not found in live data' });
            continue;
          }

          const updates = {};
          for (const field in sectionActions) {
            if (sectionActions[field] === 'approve') {
              if (field === 'banner_image') {
                try {
                  const uploadResult = await uploadFileToS3FromPath(sectionData[field]);
                  updates[`department_banner.${bannerIndex}.${field}`] = uploadResult.s3Path;
                } catch {
                  rejectedFields.push(`${section}.${field}`);
                }
              } else {
                updates[`department_banner.${bannerIndex}.${field}`] = sectionData[field];
              }
            } else {
              rejectedFields.push(`${section}.${field}`);
            }
          }

          if (Object.keys(updates).length > 0) {
            await landingPageCollection.updateOne({}, { $set: updates });
            approvedFields[section] = updates;
            finalStatus = rejectedFields.length === 0 ? 'approved' : 'partially_approved';
          }

        } else {
          const approvedBanner = {};
          for (const field in sectionActions) {
            if (sectionActions[field] === 'approve') {
              if (field === 'banner_image') {
                try {
                  const uploadResult = await uploadFileToS3FromPath(sectionData[field]);
                  approvedBanner[field] = uploadResult.s3Path;
                } catch {
                  rejectedFields.push(`${section}.${field}`);
                }
              } else {
                approvedBanner[field] = sectionData[field];
              }
            } else {
              rejectedFields.push(`${section}.${field}`);
            }
          }

          if (Object.keys(approvedBanner).length > 0) {
            await landingPageCollection.updateOne({}, {
              $push: { department_banner: approvedBanner }
            });
            approvedFields[section] = approvedBanner;
            finalStatus = rejectedFields.length === 0 ? 'approved' : 'partially_approved';
          }
        }

      } else if (type === 'delete') {
        const section = 'department_banner';
        const sectionActions = actions[section];
        if (sectionActions.delete_department === 'approve') {
          const deptToDelete = original_data[section]?.dept;
          await landingPageCollection.updateOne({}, {
            $pull: { department_banner: { dept: deptToDelete } }
          });
          approvedFields[section] = { delete_department: deptToDelete };
          finalStatus = 'approved';
        } else {
          rejectedFields.push(`${section}.delete_department`);
        }
      }

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
    }

    return res.status(200).json({
      message: 'Review process completed',
      results
    });

  } catch (err) {
    console.error('Error reviewing department banner requests:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
