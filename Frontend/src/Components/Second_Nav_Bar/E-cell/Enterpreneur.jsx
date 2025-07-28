import { useState } from "react";
import "./Enterpreneur.css";
import LoadComp from "../../LoadComp";

export default function EnterpreN({ enterpreneur }) {
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(0);

  const totalItems = enterpreneur?.Business_name?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  if (!Array.isArray(enterpreneur)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      {enterpreneur ? (
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
              {enterpreneur
                ?.slice(startIndex, endIndex)
                .map((data, index) => (
                  <tr key={startIndex + index}>
                    <td>{startIndex + index + 1}</td>
                    <td>{data?.name}</td>
                    <td>{data?.year}</td>
                    <td className="text-left">{data?.business_name}</td>
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
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
}