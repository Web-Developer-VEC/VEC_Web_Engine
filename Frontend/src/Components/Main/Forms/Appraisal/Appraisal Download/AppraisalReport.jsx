import React, { useState, useEffect } from "react";
import LoadComp from "../../../LoadComp";
import axios from "axios";

const deptMap = [
  "AIDS",
  "AUTO",
  "CHEMISTRY",
  "CIVIL",
  "CSE",
  "CSECS",
  "EEE",
  "EIE",
  "ECE",
  "ENGLISH",
  "IT",
  "MATHS",
  "MECH",
  "TAMIL",
  "PHYSICS",
  "MECSE",
  "MBA",
];

const yearList = [
  "2025-2026",
  "2024-2025",
  "2023-2024",
  "2022-2023"
];

const AppraisalReport = () => {

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {

    if (!selectedDept || !selectedYear || !selectedType) return;

    const fetchReport = async () => {
      try {
        setLoading(true);

        const apiUrl = selectedType === "with_proof"
          ? "/api/main-backend/appraisal_doc_with_proof"
          : "/api/main-backend/appraisal_doc_without_proof";

        const response = await axios.post(
          apiUrl,
          {
            department: selectedDept,
            academic_year: selectedYear
          },
          {
            responseType: "blob"
          }
        );

        const mimeType = response.headers?.["content-type"] || "application/pdf";
        const file = new Blob([response.data], { type: mimeType });
        const fileURL = URL.createObjectURL(file);

        if (selectedType === "with_proof") {
          setPdfUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return fileURL;
          });
        } else {
          setPdfUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return "";
          });
          const link = document.createElement("a");
          link.href = fileURL;
          link.download = "Appraisal_report.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(fileURL);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();

  }, [selectedDept, selectedYear, selectedType]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);


  return (

    <div className="p-6 mt-4 pb-10 w-full min-h-[100vh]">

      <h2 className="text-center text-[24px] text-brwn dark:text-drkt mb-6">
        Appraisal
      </h2>


      {/* Department + Year */}

      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">

        <select
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setSelectedType("");
            if (pdfUrl) {
              URL.revokeObjectURL(pdfUrl);
              setPdfUrl("");
            }
          }}
          className="px-4 py-2 border rounded"
        >
          <option value="">Select Department</option>

          {deptMap.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}

        </select>


        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setSelectedType("");
            if (pdfUrl) {
              URL.revokeObjectURL(pdfUrl);
              setPdfUrl("");
            }
          }}
          className="px-4 py-2 border rounded"
        >
          <option value="">Select Year</option>

          {yearList.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}

        </select>

      </div>



      {/* Proof Buttons */}
      {/* Buttons */}

      {selectedDept && selectedYear && (

        <div className="flex justify-center gap-4 mb-6">

          <button
            onClick={() => setSelectedType("with_proof")}
            className={`px-6 py-3 rounded 
            ${selectedType === "with_proof"
                ? "bg-[#800000] text-white"
                : "bg-secd dark:bg-drks"}
            hover:bg-[#a00000]`}
          >
            View
          </button>



          {/* DOWNLOAD */}

          <button
            onClick={() => setSelectedType("without_proof")}
            className={`px-6 py-3 rounded 
            ${selectedType === "without_proof"
                ? "bg-[#800000] text-white"
                : "bg-secd dark:bg-drks"}
            hover:bg-[#a00000]`}
          >
            Download
          </button>

        </div>

      )}



      {/* PDF Viewer */}

      {selectedType === "with_proof" && (

        loading ? (

          <LoadComp />

        ) : (

          pdfUrl && (

            <div className="border p-6 mt-6 w-[81%] mx-auto bg-prim dark:bg-drkp shadow-lg rounded-lg">

              <h3 className="text-xl font-bold mb-4 text-center">
                {selectedDept} {selectedYear} Appraisal Report
              </h3>


              <embed
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                width="100%"
                height="600px"
                className="border rounded"
              />

            </div>

          )

        )

      )}

    </div>

  );

};

export default AppraisalReport;
