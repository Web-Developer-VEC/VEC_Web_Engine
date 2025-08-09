import React from "react";
import "./NotificationBox.css";
import LoadComp from "../../LoadComp";

const NotificationBox = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="nss-notification-container">
      {/* Heading */}
      <div>
      <div className="nss-news-updates text-sm md:text-[16px] ml-auto md:ml-0 text-brwn dark:text-drkt border-b-2 border-[#eab308] pb-1">Bringing you the latest news & updates</div>
      {/* <div className="w-[310px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div> */}
      </div>

      {/* Scrolling Box */}
      <div className="nss-notification-box dark:bg-drkb">
        <div className="nss-notification-header">Recent Updates</div>
        <div className="scrolling-news">
          <div className="scrolling-inner">
            {data.map((item, index) =>
              typeof item === "string" ? (
                <p key={index} className="news-item text-sm md:text-base text-justify lg:text-base dark:text-drkt mb-2">
                  <li>
                    {item}
                  </li>
                </p>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBox;
