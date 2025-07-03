import React, { useEffect, useState } from "react";
import axios from "axios";

const LIBMemb = ({ lib }) => {
  const [membership, setMembership] = useState(null);

  const isMembership = lib === "Membership Details";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/library");
        const data = res.data;

        // If the response is an array, use data[0]
        const membershipData = data?.membership_details || data[0]?.membership_details;
        setMembership(membershipData);
      } catch (error) {
        console.error("Error fetching membership data:", error.message);
      }
    };

    fetchData();
  }, []);

  const members = membership?.member_details || [];
  const books = membership?.no_of_books || [];
  const cds = membership?.["periodical/back_volumes/cd"] || [];

  return (
    <div className="overflow-x-auto px-4 sm:px-8 py-10">
      {isMembership && membership && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#800000] text-center mb-8">
      Membership Details
    </h2> 
          <table className="lg:w-full  w-[600px] overflow-scroll membership-table border border-gray-300 text-center">
            <thead className="bg-gray-200">
              <tr>
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
