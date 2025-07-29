import { useState,useEffect } from "react";
import React from "react";
import {motion} from "framer-motion";
import LoadComp from "../../LoadComp";

const LibraryIntro = ({about}) => {

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

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
    <>
    {!about ? (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      ) : (

      <div className="min-h-screen flex flex-wrap items-center justify-start px-3 sm:px-5 md:px-10 py-6 sm:py-10">
          <div className="max-w-7xl self-start basis-full w-full rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
              {/* Text Content */}
              <div
                  className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6 dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl text-brwn dark:text-drkt font-extrabold">
                        ABOUT THE LIBRARY
                    </h1>


                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                      The college library is located in the Bill Gates Block, spanning the Ground and First floors. With
                      a total
                      area of <span className="font-semibold text-text dark:text-drkt">{about?.Area}</span>, it is a
                      spacious,
                      well-ventilated space. Our library houses over <span
                      className="font-semibold text-text dark:text-drkt">
                    {about?.no_of_books}</span> of books and <span
                      className="font-semibold text-text dark:text-drkt">{about?.no_of_titles} titles</span> across
                      various
                      disciplines.
                  </p>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                      Additionally, we offer access to <span className="font-semibold text-text dark:text-drkt">
            {about?.no_of_journals} Journals</span> and over <span className="font-semibold text-text dark:text-drkt">
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
                      src={UrlParser("/static/images/library/library_images/Library+front+pic.webp")}
                      className="w-full h-64 sm:h-80 md:h-full object-cover"
                      alt="Library"
                      />
              </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-4 justify-center mt-[45px] w-full">
                  <div className={`lg:basis-[49%] border-l-4 p-4 border-secd dark:border-drks rounded-xl w-full
                  bg-prim dark:bg-drkb`} >
                      <p className="text-[#800000] dark:text-drkt text-[20px] font-semibold mb-3 font-poppins border-b-[2px] border-secd dark:border-drks inline-block pb-1">Vision</p>
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-poppins text-justify">{about?.vision}</p>
                  </div>
                  <div className={`lg:basis-[49%] border-l-4 p-4 border-secd dark:border-drks rounded-xl w-full
                  bg-prim dark:bg-drkb`} >
                      <p className="text-[#800000] dark:text-drkt text-[20px] font-semibold mb-3 font-poppins border-b-[2px] border-secd dark:border-drks inline-block pb-1">Mission</p>
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-poppins text-justify">{about?.mission}</p>
                  </div>
          </div>    
          <div className="min-h-screen py-10 px-4 sm:px-6 flex flex-col items-center text-center w-full">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accn dark:text-drkt mb-6 sm:mb-10">
                    GENERAL INSTRUCTIONS
                </h2>
                <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {about?.general_instructions?.map((instruction, index) => (
                        <motion.div
                        key={index}
                        className="relative dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                        rounded-lg shadow-md sm:shadow-lg p-4 sm:p-6 flex items-center cursor-pointer
                        transition-all duration-500 hover:bg-[color-mix(in_srgb,theme(colors.secd),transparent_85%)]
                        dark:hover:bg-[color-mix(in_srgb,theme(colors.drks),transparent_85%)]"
                        initial={{opacity: 0, scale: 0.9}}
                        whileInView={{opacity: 1, scale: 1}}
                        transition={{duration: 0.5, delay: index * 0.1}}
                        viewport={{once: true}}
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <span
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center
                                    bg-[#800000] text-white dark:bg-[#800000] dark:text-white font-bold rounded-full text-sm sm:text-lg
                                    transition-transform duration-500"
                                    >
                                {index + 1}
                                </span>
                            <p className="text-sm sm:text-base md:text-lg">{instruction}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
      </div>
      )}
      
    </>
  );
};

export default LibraryIntro;
