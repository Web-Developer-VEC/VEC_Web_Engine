import React from "react";

const LibraryIntro = ({about}) => {
  console.log("About",about);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-50 to-white px-3 sm:px-5 md:px-10 py-6 sm:py-10">
      <div className="max-w-7xl w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Text Content */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-black">
            ABOUT THE LIBRARY
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-800 leading-relaxed">
            The college library is located in the Bill Gates Block, spanning the Ground and First floors. With a total area of <span className="font-semibold text-yellow-600">{about?.Area}</span>, it is a spacious, well-ventilated space. Our library houses over <span className="font-semibold text-yellow-600">{about?.no_of_books}</span> of books and <span className="font-semibold text-black">{about?.no_of_titles} titles</span> across various disciplines.
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-800 leading-relaxed">
            Additionally, we offer access to <span className="font-semibold text-yellow-600">{about?.no_of_journals} Journals</span> and over <span className="font-semibold text-black">{about?.no_of_online_journals} online journals</span>. The library follows the Universal Decimal Classification Scheme and operates on an Open Access System.
          </p>

          {/* Library Timings */}
          <div className="bg-gradient-to-r from-yellow-50 to-white p-3 sm:p-5 rounded-xl border border-yellow-100">
            <h2 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-4">Library Timings</h2>
            <ul className="space-y-1 text-xs sm:text-sm md:text-lg text-gray-800">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                <span>Working Days: 8.00 AM to 6.00 PM</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                <span>All Holidays: 8.00 AM to 5.00 PM (Except Govt. Holidays)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                <span>Vacation Period: 8:00 AM to 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-r from-yellow-100 to-white">
          <img
            src="https://img.freepik.com/free-photo/library-with-books_1063-98.jpg?t=st=1739020649~exp=1739024249~hmac=b239448fff3770a7d95c0d620bc0b964bbf2e1cd3267ab85b8af065e14f146d2&w=900"
            className="w-full h-64 sm:h-80 md:h-full object-cover"
            alt="Library"
          />
        </div>
      </div>
    </div>
  );
};

export default LibraryIntro;
