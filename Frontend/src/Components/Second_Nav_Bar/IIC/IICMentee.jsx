import React from 'react';

const menteeData = [
  { sno: 1, institute: "ABC Institute of Technology", zone: "South" },
  { sno: 2, institute: "XYZ College of Engineering", zone: "North" },
  { sno: 3, institute: "LMN University", zone: "East" },
  { sno: 4, institute: "PQR Polytechnic", zone: "West" }
];

const IICMentee = () => {
  return (
    <div className="p-8">
      <h6 className="text-[32px] font-bold mb-4 text-center">IIC Mentee Table</h6>

      <div className="overflow-x-auto border border-black rounded-md">
        <table className="min-w-full table-auto border border-black text-[16px]">
          <thead >
            <tr className="bg-gray-200">
              <th className="border border-black px-4 py-3">S.No.</th>
              <th className="border border-black px-4 py-3">Mentee Institute</th>
              <th className="border border-black px-4 py-3">Zone</th>
            </tr>
          </thead>
          <tbody>
            {menteeData.map((item) => (
              <tr key={item.sno}>
                <td className="border border-black px-4 py-3 text-center">{item.sno}</td>
                <td className="border border-black px-4 py-3">{item.institute}</td>
                <td className="border border-black px-4 py-3">{item.zone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IICMentee;
