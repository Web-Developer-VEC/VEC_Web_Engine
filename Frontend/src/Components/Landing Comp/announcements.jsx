import React, { useState, useEffect } from "react";
import "./announcements.css";
import img1 from "../Assets/hostel.png";
import star from "../Assets/championship.gif";

const Announcements1 = ({ anno = [], spc = [] }) => {
    const [flipped, setFlipped] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const content = spc[0]?.list_of_contents || [];
    const links = spc[0]?.list_of_links || [];

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    const itemsPerPage = 5; // ✅ fixed number of announcements per side

    useEffect(() => {
        let flipInterval;
        let indexUpdateInterval;

        if (!hovered && anno.length > 0) {
            // flip every 6.25s
            flipInterval = setInterval(() => {
                setFlipped((prev) => !prev);
            }, 6250);

            // shift announcements every 12.7s
            indexUpdateInterval = setInterval(() => {
                setCurrentIndex((prevIndex) =>
                    (prevIndex + itemsPerPage) % anno.length
                );
            }, 12700);
        }

        return () => {
            clearInterval(flipInterval);
            clearInterval(indexUpdateInterval);
        };
    }, [hovered, anno.length]);

    const handleManualFlip = () => {
        setFlipped((prev) => !prev);
    };

    // ✅ Slice safely
    const frontItems = anno.slice(currentIndex, currentIndex + itemsPerPage);
    const backItems = anno.slice(
        (currentIndex + itemsPerPage) % anno.length,
        (currentIndex + itemsPerPage * 2) % anno.length || anno.length
    );

    // ✅ fallback: if backItems empty, wrap around
    const safeBackItems =
        backItems.length > 0
            ? backItems
            : anno.slice(0, itemsPerPage);

    return (
        <div className="news-container bg-prim dark:bg-drkp text-text dark:text-drkt font-popp mt-4 w-full">
            <div className="announcement-wrapper flex flex-col md:flex-row w-full min-h-[50vh]">
                
                {/* Image Section */}
                <div className="image-section hidden md:block md:w-[40%] lg:w-[30%] relative">
                    <div className="image-overlay"></div>
                    <img className="college-image" src={img1} alt="college" />
                </div>

                {/* Nominations Section */}
                <div className="nominations-section w-full md:w-[55%] lg:w-[35%] px-4 md:px-0">
                    {spc.map((item) => (
                        <div key={item.title} className="mb-4">
                            <h2 className="lan-section-title">{item.title}</h2>
                            <p className="section-content">{item.content}</p>
                        </div>
                    ))}
                    <ul className="awards-list">
                        {content.map((item, index) => (
                            <li className="award-item" key={index}>
                                <img className="award-icon" src={star} alt="Trophy" />
                                <a
                                    href={links[index]}
                                    className="award-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Announcements Section */}
                <div className="announcements-card w-[220px] md:w-[220px] lg:w-[25%] px-4 md:px-0">
                    <div
                        className="card-container"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                            
                            {/* FRONT SIDE */}
                            <div className="card-front">
                                <h2 className="card-title">Announcements</h2>
                                <div className="announcements-content">
                                    {frontItems.map((item, i) => (
                                        <p key={i} className="announcement-item">
                                            <a
                                                href={UrlParser(item?.pdf_path || item?.link)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="announcement-link text-left"
                                            >
                                                <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                {item?.announcement_name}
                                            </a>
                                        </p>
                                    ))}
                                </div>
                                <div className="flip-buttons">
                                    <button className="flip-btn" onClick={handleManualFlip}>↻</button>
                                    <button className="flip-btn" onClick={handleManualFlip}>↺</button>
                                </div>
                            </div>

                            {/* BACK SIDE */}
                            <div className="card-back">
                                <h2 className="card-title">Announcements</h2>
                                <div className="announcements-content">
                                    {safeBackItems.map((item, i) => (
                                        <p key={i} className="announcement-item">
                                            <a
                                                href={UrlParser(item?.pdf_path || item?.link)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="announcement-link text-left"
                                            >
                                                <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                {item?.announcement_name}
                                            </a>
                                        </p>
                                    ))}
                                </div>
                                <div className="flip-buttons">
                                    <button className="flip-btn" onClick={handleManualFlip}>↻</button>
                                    <button className="flip-btn" onClick={handleManualFlip}>↺</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Announcements1;
