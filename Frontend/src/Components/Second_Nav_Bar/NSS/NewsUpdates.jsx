import React, { useRef } from "react";
import "./NotificationBox.css";

const NotificationBox = () => {
  const marqueeRef = useRef(null);

  return (
    <div className="nss-notification-container">
      {/* Left-side text */}
      <div className="nss-news-updates">
        Bringing you the latest news & updates 📢
      </div>

      {/* Right-side notification box */}
      <div className="nss-notification-box">
        <div className="nss-notification-header">Recent Updates</div>
        <div className="nss-notification-content">
          <marquee
            ref={marqueeRef}
            behavior="scroll"
            direction="up"
            scrollamount="3"
            onMouseOver={() => marqueeRef.current && marqueeRef.current.stop()}
            onMouseOut={() => marqueeRef.current && marqueeRef.current.start()}
          >
            <p>1. College Fest 2025 will be held on March 25th.</p>
            <p>
              2. We have successfully completed Eco-Nomics 3.0, a 100-day tree
              plantation initiative by NSS volunteers.
            </p>
            <p>3. The annual sports meet is scheduled for April 10th.</p>
          </marquee>
        </div>
      </div>
    </div>
  );
};

export default NotificationBox;
