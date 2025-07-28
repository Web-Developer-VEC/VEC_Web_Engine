import React from 'react';
import LoadComp from '../../LoadComp';

const IICContact = ({data}) => {
  return (
    <>
      {data ? (
        <div className="border-l-4 border-secd dark:border-drks rounded-2xl  shadow-md p-6 max-w-md mx-auto my-32 dark:bg-drkb">
          <h2 className="text-[32px] font-bold text-center text-brwn dark:text-drkt mb-4">IIC Contact</h2>
          <div className="space-y-2 text-[16px]">
            <p><span className="font-semibold">Name:</span> {data?.name}</p>
            <p><span className="font-semibold">Position:</span> {data?.designation}</p>
            <p><span className="font-semibold">Mobile:</span> {<a href={`tel:${data?.phone}`} className="dark:text-drka hover:underline">{data?.phone}</a>}</p>
            <p><span className="font-semibold">Email:</span> <a href={`mailto:${data?.gmail}`} className="dark:text-drka hover:underline">{data?.gmail}</a></p>
          </div>
        </div>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
};

export default IICContact;
