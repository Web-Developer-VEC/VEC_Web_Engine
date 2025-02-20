import React from "react";

const LibraryIntro = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-5 md:px-10 py-6 sm:py-10">
      <div className="max-w-7xl w-full rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Text Content */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6 dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l
            from-secd dark:from-drks to-[color-mix(in_srgb,theme(colors.secd),transparent_70%)] dark:to-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]">
            ABOUT THE LIBRARY
          </h1>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            The college library is located in the Bill Gates Block, spanning the Ground and First floors. With a total
            area of <span className="font-semibold text-secd dark:text-drks">24,000 sq. ft.</span>, it is a spacious,
            well-ventilated space. Our library houses over <span className="font-semibold text-secd dark:text-drks">
            77,525 volumes</span> of books and <span className="font-semibold text-secd dark:text-drks">25,156 titles</span> across various disciplines.
          </p>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed">
            Additionally, we offer access to <span className="font-semibold text-secd dark:text-drks">
            174 National and International Journals</span> and over <span className="font-semibold text-secd dark:text-drks">
            9,517 online journals</span>. The library follows the Universal Decimal Classification Scheme and operates
            on an Open Access System.
          </p>

          {/* Library Timings */}
          <div className="bg-prim dark:bg-drkp p-3 sm:p-5 rounded-xl border border-yellow-100">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Library Timings</h2>
            <ul className="space-y-1 text-xs sm:text-sm md:text-lg">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-secd dark:bg-drks rounded-full"></span>
                <span>Working Days: 8.00 AM to 6.00 PM</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-secd dark:bg-drks rounded-full"></span>
                <span>All Holidays: 8.00 AM to 5.00 PM (Except Govt. Holidays)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-secd dark:bg-drks rounded-full"></span>
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
