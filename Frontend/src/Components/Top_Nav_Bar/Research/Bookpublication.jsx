import { useEffect, useState } from "react";
import "./Bookpublication.css";
import Banner from "../../Banner";

export default function Bookpublication({ theme, toggle }) {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const departmentMapping = {
    "000": "Placement",
    "001": "AI&DS",
    "002": "AUTO",
    "003": "Chemistry",
    "004": "CIVIL",
    "005": "CSE",
    "006": "CYBER SECURITY",
    "007": "EEE",
    "008": "EIE",
    "009": "ECE",
    "010": "English",
    "011": "IT",
    "012": "Mathematics",
    "013": "MECH",
    "014": "Tamil",
    "015": "Physics",
    "016": "MCA",
    "017": "MBA",
    "020": "Physical Education",
    "021": "Placement",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/books");
        const data = await response.json();
        if (response.ok) {
          console.log("Ajith",response);
          
          const groupedBooks = {};

          data.forEach((dept) => {
            dept.publications.forEach((pub) => {
              const author = pub.details.AUTHORNAME[0];
              if (!groupedBooks[author]) {
                groupedBooks[author] = [];
              }
              groupedBooks[author].push({
                bookName: pub.details.BOOKNAME[0],
                isbn: pub.details["ISBN/ISSN NO"][0],
                date: pub.details["MONTH&YEAR"][0],
                chapter: pub.details["BOOK CHAPTER"][0],
                department: departmentMapping[dept.dept_id] || "Unknown",
              });
            });
          });

          setBooks(Object.entries(groupedBooks).map(([author, books]) => ({ author, books })));
        }
      } catch (error) {
        console.error("Fetching Error:", error);
      }
    };
    fetchData();
  }, []);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = books.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Book Publication"
        subHeaderText="Enrich Your Knowledge"
      />

      <div className="Bookpublisher-container">
        <div className="Bookpublisher-content">
          <div className="Bookpublisher-title-container">
            <h2 className="research-book-title">Book publication</h2>
          </div>

          <div className="Bookpublisher-table-container">
            <table className="Faculty-books-table border-2 border-black border-separate border-spacing-0 rounded-lg">
              <thead>
                <tr>
                  <th className="border border-black p-3">Author</th>
                  <th className="border border-black p-3">Department</th>
                  <th className="border border-black p-3">Book Name</th>
                  <th className="border border-black p-3">ISBN No</th>
                  <th className="border border-black p-3">Publication Date</th>
                  {/* <th className="border border-black p-3">Book Chapter</th> */}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((faculty, facultyIndex) => {
                  return faculty.books.map((book, bookIndex) => (
                    <tr key={`${facultyIndex}-${bookIndex}`}>
                      {bookIndex === 0 && (
                        <td rowSpan={faculty.books.length} className="border border-black p-3">
                          {faculty.author}
                        </td>
                      )}
                      {bookIndex === 0 && (
                        <td rowSpan={faculty.books.length} className="border border-black p-3">
                          {book.department}
                        </td>
                      )}
                      <td className="border border-black p-3">{book.bookName}</td>
                      <td className="border border-black p-3">{book.isbn}</td>
                      <td className="border border-black p-3">{book.date}</td>
                      {/* <td className="border border-black p-3">{book.chapter}</td> */}
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
          <div className="pagination-container mt-4 flex justify-center space-x-4">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-lg font-semibold">
              Page {currentPage} of {Math.ceil(books.length / rowsPerPage)}
            </span>
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={indexOfLastRow >= books.length}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}