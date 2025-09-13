import React from "react";
import "./NSSCotent.css"; // Import the CSS file

const NSSContent = ({data}) => {
  let content;
  if (Array.isArray(data)) {
    content = data[0];
  }
  return (
    <div className="nss-container">
      <div className="nss-content">
        {/* Left Section - NSS Introduction */}
        <div className="nss-box border-l-4 border-secd dark:border-drks
          dark:bg-drkb hover:scale-105 ease-in-out duration-300">
          <h2 class="nss-title text-accn dark:text-drkt inline-block border-b-2 border-secd dark:text-drks pb-1">
            Welcome to the National Service Scheme
          </h2>
          <p className="nss-list marker:text-accn dark:marker:text-drka">
             {content?.about?.map((item, index) => (
            <p key={index}>
              <li>
                {item}
              </li>
            </p>
          ))}
          </p>
        </div>
        {/* Right Section - Objectives */}
        <div className="nss-box border-l-4 border-secd dark:border-drks
          dark:bg-drkb hover:scale-105 ease-in-out duration-300">
          <h2 className="nss-title text-accn dark:text-drkt inline-block border-b-2 border-secd dark:text-drks pb-1">Our Objectives</h2>
          <ul className="nss-list marker:text-accn dark:marker:text-drka">
            {content?.objectives?.map((item, index) => (
            <p key={index}>
              <li>
                {item}
              </li>
            </p>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NSSContent;
