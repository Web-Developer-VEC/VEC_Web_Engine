import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadComp from "../../LoadComp";

const LIBMemb = ({ data }) => {
  const members = data?.member_details || [];
  const books = data?.no_of_books || [];
  const cds = data?.periodical_back_volumes_cd || [];

   if (!data) {
      return (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
            <LoadComp />
          </div>
      );
    }

  return (
    <div className="overflow-x-auto px-4 sm:px-8 py-10">
      {data && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#800000] dark:text-drkt text-center mb-8">
            Membership Details
          </h2> 
          <table className="lg:w-full  w-[600px] overflow-scroll membership-table border border-gray-300 text-center">
            <thead className="bg-[#e5e7eb]">
              <tr className="text-text">
                <th className="border p-2">S. No</th>
                <th className="border p-2">Member Details</th>
                <th className="border p-2">No. of Books</th>
                <th className="border p-2">Periodical / Back Volume / CD</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{idx + 1}</td>
                  <td className="border p-2">{member}</td>
                  <td className="border p-2">{books[idx]}</td>
                  <td className="border p-2">{cds[idx]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default LIBMemb;
