import React from 'react';

const IICContact = ({data}) => {
  return (
    <div className="border-l-4 border-secd rounded-2xl  shadow-md p-6 max-w-md mx-auto my-32 ">
      <h2 className="text-[32px] font-bold text-center text-[#800000] mb-4">IIC Contact</h2>
      <div className="space-y-2 text-[16px]">
        <p><span className="font-semibold">Name:</span> {data?.name}</p>
        <p><span className="font-semibold">Position:</span> {data?.designation}</p>
        <p><span className="font-semibold">Mobile:</span> {<a href={`tel:${data?.phone}`} className="text-blue-600 hover:underline">{data?.phone}</a>}</p>
        <p><span className="font-semibold">Email:</span> <a href={`mailto:${data?.gmail}`} className="text-blue-600 hover:underline">{data?.gmail}</a></p>
      </div>
    </div>
  );
};

export default IICContact;
