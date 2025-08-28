import React from 'react';

export const Button = ({ children, className, ...props }) => {
  return (
    <button className={`px-6 py-3 rounded-lg shadow-md ${className}`} {...props}>
      {children}
    </button>
  );
};
