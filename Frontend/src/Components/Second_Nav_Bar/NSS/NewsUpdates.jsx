import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import "./NotificationBox.css";
import LoadComp from "../../LoadComp";

const NotificationBox = ({ data }) => {
  const marqueeRef = useRef(null);

  return (

    <>
      {data ? (

      <div className="nss-notification-container">
        {/* Left-side text */}
        <div className="nss-news-updates text-sm md:text-[16px] ml-auto md:ml-2 text-brwn dark:text-drkt">
          Bringing you the latest news & updates 
          <div className="w-[300px] h-0.5 bg-[#eab308] mx-auto mt-1 rounded"></div>
        </div>

        {/* Right-side notification box */}
        <div className="nss-notification-box dark:bg-drkb">
          <div className="nss-notification-header">Recent Updates</div>
          <div className="nss-notification-content">
            {data?.updaates.length > 0 ? (
              <marquee
                ref={marqueeRef}
                behavior="scroll"
                direction="up"
                scrollamount="3"
                onMouseOver={() => marqueeRef.current?.stop()}
                onMouseOut={() => marqueeRef.current?.start()}
              >
                {data?.updaates.map((item, index) => (
                  <p key={index} className="text-text dark:text-drkt">
                    {index + 1}. {item}
                  </p>
                ))}
              </marquee>
            ) : (
              <p className="text-center text-gray-500 p-4"></p>
            )}
          </div>
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

export default NotificationBox;
