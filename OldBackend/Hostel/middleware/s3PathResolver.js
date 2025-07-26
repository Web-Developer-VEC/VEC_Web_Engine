function resolveS3Path(fieldname) {
  switch (fieldname) {
    case 'file':
      return 'student_docs';
    case 'wardenImage':
      return 'images/warden_profile_images';
    case 'studentImage':
      return 'images/student_profile_images';
    default:
      return 'temp';
  }
}

module.exports = resolveS3Path;