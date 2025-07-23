import React from 'react';

// const menteeData = [
//   { sno: 1, institute: "ABC Institute of Technology", zone: "South" },
//   { sno: 2, institute: "XYZ College of Engineering", zone: "North" },
//   { sno: 3, institute: "LMN University", zone: "East" },
//   { sno: 4, institute: "PQR Polytechnic", zone: "West" }
// ];

const IICMentee = ({data}) => {
  return (
    <div className="p-8">
      <h2 className="text-4xl text-brwn font-bold mb-4 text-center"> Mentee Institution </h2>

      <div className="overflow-x-auto border border-black rounded-md">
        <table className="min-w-full table-auto border border-black text-[16px]">
          <thead >
            <tr className="bg-gray-200">
              <th className="border border-black px-4 py-3">S.No.</th>
              <th className="border border-black px-4 py-3">Mentee Institute</th>
               <th className="border border-black px-4 py-3">State</th>
              <th className="border border-black px-4 py-3">Zone</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item,i) => (
              <tr key={i}>
                <td className="border border-black px-4 py-3 text-center">{i+1}</td>
                <td className="border border-black px-4 py-3">{item.mentee_institute}</td>
                <td className="border border-black px-4 py-3">{item.State}</td>
                <td className="border border-black px-4 py-3">{item.Zone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IICMentee;
