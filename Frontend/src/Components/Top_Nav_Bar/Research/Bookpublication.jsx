import { useEffect, useState } from "react";
import "./Bookpublication.css";
import Banner from "../../Banner";

export default function Bookpublication({theme, toggle}) {
  const [pdfUrl, setPdfUrl] = useState(null); // Default PDF
  const [activeYear, setActiveYear] = useState(null); // Track active button
  const [books, setBooks] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_research_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: "book_publications" }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setBooks(data);
          setPdfUrl(data?.pdf_path[0]);
          setActiveYear(data?.year[0]);
        }
      } catch (error) {
        console.error("Fetching Error:", error);
      }
    }

    fetchData();
  }, []);

  const data = [
    {
      faculty: "Dr. John Doe",
      books: [
        {
          publisher: "Oxford Publications",
          isbn: "978-3-16-148410-0",
          collaboration: "Harvard University",
          eCopy: "#",
        },
        {
          publisher: "Springer",
          isbn: "978-1-23-456789-7",
          collaboration: "MIT",
          eCopy: "#",
        },
        {
          publisher: "IEEE Press",
          isbn: "978-0-12-345678-9",
          collaboration: "Stanford",
          eCopy: "#",
        },
      ],
    },
    {
      faculty: "Prof. Jane Smith",
      books: [
        {
          publisher: "Elsevier",
          isbn: "978-4-56-789123-0",
          collaboration: "UC Berkeley",
          eCopy: "#",
        },
        {
          publisher: "Taylor & Francis",
          isbn: "978-5-67-890123-4",
          collaboration: "Caltech",
          eCopy: "#",
        },
      ],
    },
  ];

  return (
   <>
    
    <div className="Bookpublisher-container">
      <div className="Bookpublisher-content">
            
            <div className="Bookpublisher-title-container">
              <h2 >Book publication - Department wise Consolidation   </h2>

            </div>

      <div className="Bookpublisher-table-container ">
      <table className="Faculty-books-table  border-2 border-black border-separate border-spacing-0 rounded-lg">
      <thead className="border border-black p-3">
        <tr>
          <th className="border border-black p-3">Name of the Faculty</th>
          <th className="border border-black p-3">Name of the Publisher</th>
          <th className="border border-black p-3">ISBN No</th>
          <th className="border border-black p-3">Collaboration Institution</th>
          <th className="border border-black p-3">E-Copy of Book</th>
        </tr>
      </thead>
      <tbody>
        {data.map((faculty, facultyIndex) => {
          return faculty.books.map((book, bookIndex) => (
            <tr key={`${facultyIndex}-${bookIndex}`}>
              {bookIndex === 0 && (
                <td rowSpan={faculty.books.length} className="border border-black p-3">{faculty.faculty}</td>
              )}
              <td className="border border-black p-3">{book.publisher}</td>
              <td className="border border-black p-3">{book.isbn}</td>
              <td className="border border-black p-3">{book.collaboration}</td>
              <td className="border border-black p-3">
                <a href={book.eCopy} target="_blank" rel="noopener noreferrer"  className="text-blue-600 no-underline hover:underline">
                  Download
                </a>
              </td>
            </tr>
          ));
        })}
      </tbody>
    </table>

            </div>
      </div>

    </div>

    </>
  );
}
