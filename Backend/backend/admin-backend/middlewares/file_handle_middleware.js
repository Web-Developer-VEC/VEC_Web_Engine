// insertFile.js
const { s3, bucketName } = require("../config/s3");

async function insertFile(tempDoc) {
  try {
    const updatedPaths = [];

    for (const filePath of tempDoc.image_path || []) {
      // ✅ Replace /temp/static/ with /static/
      const newPath = filePath.replace("/temp/static/", "/static/");

      // ✅ Move file in S3 (copy → delete)
      const copyParams = {
        Bucket: bucketName,
        CopySource: `${bucketName}${filePath}`,
        Key: newPath.startsWith("/") ? newPath.slice(1) : newPath,
      };

      const deleteParams = {
        Bucket: bucketName,
        Key: filePath.startsWith("/") ? filePath.slice(1) : filePath,
      };

      await s3.copyObject(copyParams).promise();
      await s3.deleteObject(deleteParams).promise();

      updatedPaths.push(newPath);
    }

    // ✅ Ensure meta_data.filePaths is updated
    return {
      ...tempDoc,
      image_path: updatedPaths,
      meta_data: {
        ...tempDoc.meta_data,
        filePaths: updatedPaths,
      },
    };
  } catch (error) {
    console.error("insertFile error:", error);
    throw error;
  }
}

module.exports = insertFile;
