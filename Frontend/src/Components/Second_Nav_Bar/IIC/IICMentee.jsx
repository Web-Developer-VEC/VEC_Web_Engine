import React from 'react';
import LoadComp from '../../LoadComp';

const IICMentee = ({data}) => {
  return (
    <>
      {data ? (
        <div className="p-8">
          <h2 className="text-4xl text-brwn dark:text-drkt font-bold mb-4 text-center"> Mentee Institution </h2>

          <div className="overflow-x-auto border border-black rounded-md">
            <table className="min-w-full table-auto border border-black text-[16px]">
              <thead >
                <tr className="bg-gry">
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
      ): (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
};

export default IICMentee;
