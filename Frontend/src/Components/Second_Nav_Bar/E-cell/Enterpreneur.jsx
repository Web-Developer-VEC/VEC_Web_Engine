import { useState } from "react";
import "./Enterpreneur.css";

export default function EnterpreN({ enterpreneur }) {
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(0);

  const totalItems = enterpreneur?.Business_name?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate slice start & end based on currentPage
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="enter-container">
      <div className="overflow-x-auto">
        <table className="styled-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name of the Student</th>
              <th className="w-[300px]">Batch</th>
              <th>Name of the Company</th>
            </tr>
          </thead>
          <tbody>
            {enterpreneur?.Business_name
              ?.slice(startIndex, endIndex) // 👉 show only current page rows
              .map((bus, index) => (
                <tr key={startIndex + index}>
                  <td>{startIndex + index + 1}</td>
                  <td>{enterpreneur?.name[startIndex + index]}</td>
                  <td>{enterpreneur?.year[startIndex + index]}</td>
                  <td className="text-left">{bus}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination controls */}
      <div className="flex justify-center items-center gap-4 my-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded ${
            currentPage === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Previous
        </button>

        <span>
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages - 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}