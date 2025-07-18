import React from 'react';

const IICContact = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-md mx-auto my-32 border border-gray-200">
      <h2 className="text-[32px] font-bold text-center text-[#800000] mb-4">IIC Contact</h2>
      <div className="space-y-2 text-[16px]">
        <p><span className="font-semibold">Name:</span> Mr. M. Yuvaraj</p>
        <p><span className="font-semibold">Position:</span> IIC Convener</p>
        <p><span className="font-semibold">Mobile:</span> <a href="tel:9750426069" className="text-blue-600 hover:underline">9750426069</a></p>
        <p><span className="font-semibold">Email:</span> <a href="mailto:iic@velammal.ed.in" className="text-blue-600 hover:underline">iic@velammal.ed.in</a></p>
      </div>
    </div>
  );
};

export default IICContact;
