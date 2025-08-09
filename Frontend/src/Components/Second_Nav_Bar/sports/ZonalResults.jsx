import React from 'react';
import LoadComp from '../../LoadComp';

const ZonalResults = ({ data }) => {
  if (!data) {
    return <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
            <LoadComp />
          </div>;
  }

  // Map the fetched data into an array of objects
  const results = Array.isArray(data) ? data?.map((game, index) => ({
    game: game?.game,
    position: game?.position,
  })) : [];

  const resultPairs = [];
  for (let i = 0; i < results.length; i += 2) {
    resultPairs.push([results[i], results[i + 1]]);
  }

  return (
    <div className="container3 mx-auto p-4 mb-6">
      <h1 className="md:text-4xl text-2xl  font-bold text-accn dark:text-drkt text-center mb-4 sm:mb-6">
        Zonal Results 2024-2025
      </h1>

      {/* Desktop/Laptop View */}
      <div className="hidden sm:block overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-auto text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-left font-medium text-gray-700">Game</th>
              <th className="py-2 px-4 text-left font-medium text-gray-700">Position</th>
              <th className="py-2 px-4 text-left font-medium text-gray-700">Game</th>
              <th className="py-2 px-4 text-left font-medium text-gray-700">Position</th>
            </tr>
          </thead>
          <tbody>
          {resultPairs?.map((pair, index) => (
              <React.Fragment key={index}>
                <tr className="border-t border-gray-200 hidden sm:table-row">
                  <td className="py-3 px-4 text-left">{pair[0]?.game}</td>
                  <td className="py-3 px-4 text-left">{pair[0]?.position}</td>
                  <td className="py-3 px-4 text-left">{pair[1]?.game}</td>
                  <td className="py-3 px-4 text-left">{pair[1]?.position}</td>
                </tr>

                {/* Mobile Layout - Smaller & Stacked */}
                <tr className="border-t border-gray-200 sm:hidden text-xs">
                  <td className="py-2 px-3 font-semibold">Game</td>
                  <td className="py-2 px-3 text-left">{pair[0]?.game}</td>
                </tr>
                <tr className="border-t border-gray-200 sm:hidden text-xs">
                  <td className="py-2 px-3 font-semibold">Position</td>
                  <td className="py-2 px-3 text-left">{pair[0]?.position}</td>
                </tr>
                {pair[1] && (
                  <>
                    <tr className="border-t border-gray-200 sm:hidden text-xs">
                      <td className="py-2 px-3 font-semibold">Game</td>
                      <td className="py-2 px-3 text-left">{pair[1]?.game}</td>
                    </tr>
                    <tr className="border-t border-gray-200 sm:hidden text-xs">
                      <td className="py-2 px-3 font-semibold">Position</td>
                      <td className="py-2 px-3 text-left">{pair[1]?.position}</td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile View */}
      <div className="sm:hidden shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-xs sm:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-3 text-left font-medium text-gray-700">Game</th>
              <th className="py-2 px-3 text-left font-medium text-gray-700">Position</th>
            </tr>
          </thead>
          <tbody>
            {results?.map((item, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-2 px-3 text-left">{item?.game}</td>
                <td className="py-2 px-3 text-left">{item?.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ZonalResults;