import React from "react";

const LibraryIntro = ({about}) => {
  const tiles = [{
        hdr: "Vision", cls: "basis-4/5 lg:basis-[49%]",
        cnt: "\"To  enrich  the  knowledge  of  Velammalians  by  providing  dynamic  world  class  learning environment.To  provide  a learning  environment  with  intense  intellectual  inquiry.  To  become  the  most  dynamic  learning  environment  in  the world.  To  advance  with  successful  teaching,  learning  and  research  through  building  a  robust  One  System,  One Library. To transform the library as a place dynamic learning with ease.\""
    }, {
        hdr: "Mission", cls: "basis-4/5 lg:basis-[49%]",
        cnt: "\"To link the information with technology and make it available as knowledge at ease to the Velammalians. To provide comprehensive resources  and services in support of the research, teaching,  and learning needs of  the  college  community  To  maintain  and  improve  collections  and  achieve  efficient  services  in  an environment  of  flat  or  reduced  budgets  for  the  students,  faculty  and  staff.  To  transform  the  information available in the environment into knowledge for students, staff and faculty.\""
    }];

  function parse(cnt) {
        let lis = [];
        cnt.split("\n").map((mxt) => {
            const cxt = mxt.split("\"");
            lis.push(cxt);
        });

        return (
            <ul className={`text-base ${(lis.length === 1) ? "list-none pl-0" : "list-disc marker:text-accn dark:marker:text-drks"}`}>
                {lis.map((ite, ix) => (
                    <li key={ix}>
                        {ite.map((itm, i) => ((itm !== null && itm !== "") ?
                            <span key={i} className={(i % 2 !== 0 ? 'italic' : '')}>{itm}</span> : ""
                        ))}
                    </li>
                ))}
            </ul>
        );
    }

  return (
      <div className="min-h-screen flex flex-wrap items-center justify-start px-3 sm:px-5 md:px-10 py-6 sm:py-10">
          <div className="max-w-7xl self-start basis-full w-full rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
              {/* Text Content */}
              <div
                  className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6 dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l
            from-accn dark:from-drka to-[color-mix(in_srgb,theme(colors.accn),transparent_70%)] dark:to-[color-mix(in_srgb,theme(colors.drka),transparent_70%)]">
                      ABOUT THE LIBRARY
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                      The college library is located in the Bill Gates Block, spanning the Ground and First floors. With
                      a total
                      area of <span className="font-semibold text-black dark:text-black">{about?.Area}</span>, it is a
                      spacious,
                      well-ventilated space. Our library houses over <span
                      className="font-semibold text-black dark:text-black">
            {about?.no_of_books}</span> of books and <span
                      className="font-semibold text-black dark:text-black">{about?.no_of_titles} titles</span> across
                      various
                      disciplines.
                  </p>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                      Additionally, we offer access to <span className="font-semibold text-black dark:text-black">
            {about?.no_of_journals} Journals</span> and over <span className="font-semibold text-black dark:text-black">
            {about?.no_of_online_journals} online journals</span>. The library follows the Universal Decimal
                      Classification Scheme and operates
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
              <div
                  className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-r from-yellow-100 to-white">
                  <img
                      src="https://img.freepik.com/free-photo/library-with-books_1063-98.jpg?t=st=1739020649~exp=1739024249~hmac=b239448fff3770a7d95c0d620bc0b964bbf2e1cd3267ab85b8af065e14f146d2&w=900"
                      className="w-full h-64 sm:h-80 md:h-full object-cover"
                      alt="Library"
                  />
              </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-4 justify-center lg:-mt-40">
              {tiles.map((tile, index) => (
                  <div className={`${tile.cls} border-l-8 p-4 border-secd dark:border-drks rounded-xl 
                            bg-gray-100 dark:bg-gray-700`} key={index}>
                      <p className="text-xl mb-2 text-text dark:text-drks font-poppins">{tile.hdr}</p>
                      <p className="text-base font-poppins">{parse(tile.cnt)}</p>
                  </div>
              ))}
          </div>
      </div>
  );
};

export default LibraryIntro;
