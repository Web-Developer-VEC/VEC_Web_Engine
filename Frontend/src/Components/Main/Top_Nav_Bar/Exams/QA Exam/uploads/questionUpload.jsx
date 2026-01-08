import React from "react";
import ReusableUploadPage from "./ReusableUploadPage";

const QuestionUploadPage = () => {
  return (
    <ReusableUploadPage
      title="Question Data Upload"
      description="Upload Excel file containing QA/VR/BS Questions"
      options={["QA", "VR", "BS"]}
      apiUrl="/api/main-backend/excelupload"
      uploadFor="question"
    />
  );
};

export default QuestionUploadPage;