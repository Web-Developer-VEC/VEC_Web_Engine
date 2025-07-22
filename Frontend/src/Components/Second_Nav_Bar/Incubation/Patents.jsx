import { useState } from "react";

export default function Patents({ data }) {
  const rowsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate start and end indices
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data?.slice(startIndex, endIndex);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="ic-table-container m-4">
      <div>
        <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Patents</p>
      </div>
      <div className="overflow-x-auto">
        <table className="ic-data-table">
          <thead>
            <tr>
              <th className="ic-table-head border-2 border-text dark:border-prim">SL No</th>
              <th className="ic-table-head border-2 border-text dark:border-prim">Patent Application No</th>
              <th className="ic-table-head border-2 border-text dark:border-prim">Status of Patent</th>
              <th className="ic-table-head border-2 border-text dark:border-prim">Inventor's Name</th>
              <th className="ic-table-head border-2 border-text dark:border-prim">Title of the Patent</th>
              <th className="ic-table-head border-2 border-text dark:border-prim">Applicant's Name</th>
              <th className="ic-table-head border-2 border-text dark:border-prim">Published date</th>
            </tr>
          </thead>
          <tbody>
            {currentData?.map((startup, i) => (
              <tr key={startIndex + i}>
                <td className="ic-table-data">{startup["Sl. No."]}</td>
                <td className="ic-table-data">{startup["Patent Application No."]}</td>
                <td className="ic-table-data">
                  {startup["Status of Patent (Published / Granted)"]}
                </td>
                <td className="ic-table-data text-left">
                    {startup["Inventor/s Name"].map((div,i)=>(
                        <l>
                            {div}
                        </l>
                    ))}
                </td>
                <td className="ic-table-data">{startup["Title of the Patent"]}</td>
                <td className="ic-table-data">{startup["Applicant/s Name"]}</td>
                <td className="ic-table-data">
                  {startup["Patent Filed Date (DD/MM/YYYY) "]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}