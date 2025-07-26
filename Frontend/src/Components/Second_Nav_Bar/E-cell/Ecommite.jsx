import React from "react";
import "./Ecommite.css";
import LoadComp from "../../LoadComp";

export default function COMMITE({ committee }) {

    const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  return (
    <>
      {committee ? (
      <div className="p-8">
        <h2 className="title-h3">COMMITEE MEMBERS</h2>
        <div className="ecell-members-grid">
          {committee?.entrepreneur_men?.name?.map((name, index) => (
            <div key={index} className="faculty-card dark:bg-text">
    
              <div className="ncc-n-stu-detail p-4 text-[16px] text-left">
                <h5 className="text-center">{name}</h5>
                <p className="pl-4 text-brwn dark:text-drka text-sm">
                  Affiliation: {committee.entrepreneur_men.affiliation[index]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="ecell-members-grid">
          {committee?.entrepreneur_women?.name?.map((name, index) => (
            <div key={index} className="faculty-card dark:bg-text">
              <div className="ncc-n-stu-detail p-4 text-left">
                <h5 className="text-center">{name}</h5>
                <p className="pl-4 text-brwn dark:text-drka text-sm">
                  Affiliation: {committee?.entrepreneur_women?.affiliation?.[index]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
}
