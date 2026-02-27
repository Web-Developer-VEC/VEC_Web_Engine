import React from "react";
import { useLocation } from "react-router";
import QuestionUploadPage from "./questionUpload";
import StudentBatchUploadPage from "./studentBatchUpload";

const UploadContainer = () => {
  const location = useLocation();

  const state = location.state?.page
  return (
    <>
      {state === "question" && <QuestionUploadPage />}
      {state === "student" && <StudentBatchUploadPage />}
    </>
  );
};

export default UploadContainer;