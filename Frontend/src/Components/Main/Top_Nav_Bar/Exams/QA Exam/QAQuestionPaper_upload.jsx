import axios from "axios";
import React, { useState } from "react";

const QAQuastionPapaerUpload = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

   const handleSubmit = async () => {
    if (!selectedOption || !file) {
      alert("Please select option and upload file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedOption);
    formData.append("fileType", file);

    try {
      setLoading(true);

      const response = await axios.post("/api/main-backend/excelupload", formData);

      const result = await response.json();
      console.log(result);
      alert("File uploaded successfully");
      setSelectedOption("")
      setFile("")
    } catch (error) {
      console.error(error);
      alert("Upload failed");
  
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Main Container */}
      <div className="w-[90%] h-[90vh] bg-white rounded-2xl shadow-xl flex items-center justify-center">
        
        {/* Center Content */}
        <div className="w-full max-w-2xl flex flex-col items-center text-center gap-10">
          
          {/* Title */}
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "#800000" }}
            >
              Data Upload
            </h1>
            <p className="text-gray-500">
              Select a category and upload your Excel file
            </p>
          </div>

          {/* Options */}
          <div className="w-full">
            <p
              className="text-lg font-semibold mb-4"
              style={{ color: "#800000" }}
            >
              Choose Type
            </p>

            <div className=" flex  gap-6 justify-center">
              {["QA", "VR", "BS" ].map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedOption(item)}
                  className={ ` w-36 h-16 rounded-xl  hover:bg- text-lg font-semibold border transition-all duration-200
                    ${
                      selectedOption === item
                        ? "shadow-md scale-105"
                        : "hover:scale-105"
                    }`}
                  style={{
                    backgroundColor:
                      selectedOption === item ? "#800000" : "transparent",
                    borderColor: "#800000",
                    color: selectedOption === item ? "#ffffff" : "#000000",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="w-full">
            <p
              className="text-lg font-semibold mb-4"
              style={{ color: "#800000" }}
            >
              Upload Excel File
            </p>

            <div
              className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4"
              style={{ borderColor: "#800000" }}
            >
              <input
                type="file"
                accept=".xls,.xlsx"
                id="excelUpload"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <label
                htmlFor="excelUpload"
                className="cursor-pointer px-8 py-3 rounded-lg font-medium"
                style={{ backgroundColor: "#fdcc03", color: "#000" }}
              >
                {file ? "Change File" : "Choose File"}
              </label>

              {file && (
                <p className="text-sm text-gray-700 font-medium">
                  {file.name}
                </p>
              )}

              <p className="text-sm text-gray-500">
                Only .xls and .xlsx files supported
              </p>
            </div>
          </div>

        </div>

        <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-3 rounded-xl font-semibold"
            style={{ backgroundColor: "#800000", color: "#fff" }}
          >
            {loading ? "Uploading..." : "Submit"}
          </button>

      </div>
    </div>
  );
};

export default QAQuastionPapaerUpload;
