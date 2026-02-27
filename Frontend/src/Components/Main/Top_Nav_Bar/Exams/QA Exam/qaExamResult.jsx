import axios from "axios";
import { useEffect, useState } from "react";
import Banner from "../../../Banner";
import { ArrowLeft, Power } from "lucide-react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

const QAExamResults = ({ toggle, theme }) => {
  const [filters, setFilters] = useState({
    cie: "",
    batch: "",
  });

  const [resultData, setResultData] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFetchResults = async () => {
    if (!filters.cie || !filters.batch) {
      Swal.fire({
        title: "Missing Filters",
        text: "Please select both CIE and Batch",
        icon: "warning",
      });
      return;
    }

    setLoading(true);

    const cieMap = {
        I: "cie1",
        II: "cie2",
        III: "cie3"
    }

    try {
      const response = await axios.post(
        "/api/main-backend/result",
        {
          cie: cieMap[filters.cie],
          batch: filters.batch,
        }
      );

      if (response.data.files) {
        setResultData(response.data.files);

        Swal.fire({
          title: "Success",
          text: "Results fetched successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setResultData([]);
      }
    } catch (error) {
      console.error("Error fetching exam results", error);

      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to fetch exam results",
        icon: "error",
      });
    }

    setLoading(false);
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const res = await axios.get(fileUrl, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed", error);

      Swal.fire({
        title: "Error",
        text: "Failed to download Excel file",
        icon: "error",
      });
    }
  };

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/examsbanner.webp"
        headerText="office of controller of examinations"
        subHeaderText="COE"
      />

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between mb-2">
            <button
              className="flex gap-2 justify-center items-center"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <h1 className="text-2xl font-bold text-brwn mb-6">
              Exam Results
            </h1>

            <button
              className="qa-logout-btn"
              onClick={() => {
                sessionStorage.removeItem("userSession");
                navigate("/login");
              }}
              title="Log out"
              type="button"
            >
              <Power size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <Select
              label="CIE"
              options={["I", "II", "III"]}
              value={filters.cie}
              onChange={(v) =>
                setFilters({ ...filters, cie: v })
              }
            />

            <Select
              label="Batch"
              options={["2023-2027", "2024-2028", "2025-2029"]}
              value={filters.batch}
              onChange={(v) =>
                setFilters({ ...filters, batch: v })
              }
            />

            <button
              className="px-4 py-2 bg-secd text-text rounded-md text-sm font-medium hover:bg-brwn hover:text-prim"
              onClick={handleFetchResults}
              disabled={loading}
            >
              {loading ? "Getting..." : "Get Results"}
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gry border-b">
                <tr>
                  <TableHead>S.No</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Total Students</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Action</TableHead>
                </tr>
              </thead>

              <tbody>
                {resultData.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500"
                    >
                      No results found
                    </td>
                  </tr>
                )}

                {resultData.map((item, index) => (
                  <tr
                    key={item.documentId}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{item.studentCount}</TableCell>
                    <TableCell>{item.examType}</TableCell>

                    <TableCell>
                      {/* <button
                        onClick={() =>
                          handleDownload(
                            item.fileUrl,
                            item.fileUrl.split("/").pop()
                          )
                        }
                        className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-full text-xs font-medium"
                      >
                        Download
                      </button> */}
                      <a href={item.fileUrl} className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-full text-xs font-medium" >Download</a>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-right">
            Showing {resultData.length} result file(s)
          </p>
        </div>
      </div>
    </>
  );
};

/* Reusable Components */

function Select({ label, options, value, onChange }) {
  return (
    <select
      className="w-full p-2.5 border rounded-md bg-prim text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{`Select ${label}`}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-4 py-3 font-semibold text-text">
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-gray-700 ${className}`}>
      {children}
    </td>
  );
}

export default QAExamResults;