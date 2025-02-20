import React from 'react';

const ZonalResults = () => {
  const results = [
    { game: "Badminton (M)", position: "Third" },
    { game: "Basketball (W)", position: "Runner" },
    { game: "Badminton (W)", position: "Runner" },
    { game: "Hockey (M)", position: "Third" },
    { game: "Chess (M)", position: "Winner" },
    { game: "Kho-Kho (M)", position: "Runner" },
    { game: "Table Tennis (W)", position: "Winner" },
    { game: "Football (M)", position: "Third" },
    { game: "Table Tennis (M)", position: "Winner" },
    { game: "Kabaddi (M)", position: "Winner" },
    { game: "Basketball (M)", position: "Runner" },
    { game: "Volleyball (M)", position: "Third" },
  ];

  const resultPairs = [];
  for (let i = 0; i < results.length; i += 2) {
    resultPairs.push([results[i], results[i + 1]]);
  }

  return (
    <div className="container3 mx-auto p-4 mb-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 sm:mb-6">
        Zonal Results 2024-2025
      </h1>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-auto text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-200 hidden sm:table-row">
              <th className="py-2 sm:py-3 px-4 sm:px-6 text-left font-medium text-gray-700">Game</th>
              <th className="py-2 sm:py-3 px-4 sm:px-6 text-left font-medium text-gray-700">Position</th>
              <th className="py-2 sm:py-3 px-4 sm:px-6 text-left font-medium text-gray-700">Game</th>
              <th className="py-2 sm:py-3 px-4 sm:px-6 text-left font-medium text-gray-700">Position</th>
            </tr>
          </thead>
          <tbody>
            {resultPairs.map((pair, index) => (
              <React.Fragment key={index}>
                <tr className="border-t border-gray-200 hidden sm:table-row even:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                    dark:even:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]">
                  <td className="py-3 px-4">{pair[0].game}</td>
                  <td className="py-3 px-4">{pair[0].position}</td>
                  <td className="py-3 px-4">{pair[1]?.game}</td>
                  <td className="py-3 px-4">{pair[1]?.position}</td>
                </tr>

                {/* Mobile Layout - Smaller & Stacked */}
                <tr className="border-t border-gray-200 sm:hidden text-xs">
                  <td className="py-2 px-3 font-semibold">Game</td>
                  <td className="py-2 px-3">{pair[0].game}</td>
                </tr>
                <tr className="border-t border-gray-200 sm:hidden text-xs">
                  <td className="py-2 px-3 font-semibold">Position</td>
                  <td className="py-2 px-3">{pair[0].position}</td>
                </tr>
                {pair[1] && (
                  <>
                    <tr className="border-t border-gray-200 sm:hidden text-xs">
                      <td className="py-2 px-3 font-semibold">Game</td>
                      <td className="py-2 px-3">{pair[1].game}</td>
                    </tr>
                    <tr className="border-t border-gray-200 sm:hidden text-xs">
                      <td className="py-2 px-3 font-semibold">Position</td>
                      <td className="py-2 px-3">{pair[1].position}</td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ZonalResults;
