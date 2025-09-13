import React, { useRef, useEffect } from "react";

const AutoResizeTextarea = ({ value, onChange, className = "", ...props }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={`form-control ${className}`}
      value={value}
      onChange={onChange}
      style={{ overflow: "hidden", resize: "none" }}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
