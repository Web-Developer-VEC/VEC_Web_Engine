import React, { useState, useEffect } from "react";
import "./announcements.css";
import img1 from "../../Assets/hostel.png";
import star from "../../Assets/championship.gif";

const Announcements1 = ({ anno, spc }) => {
    const [flipped, setFlipped] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const content = spc[0]?.list_of_contents || [];
    const links = spc[0]?.list_of_links || [];

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    
    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    const ITEMS_PER_PAGE = 4;
    const PAGE_SIZE = ITEMS_PER_PAGE * 2;

    useEffect(() => {
        setCurrentIndex(0);
        setFlipped(false);
    }, [anno.length]);

    // Auto-flip and index update
    useEffect(() => {
        let flipInterval;
        let indexUpdateInterval;

        if (!hovered) {
            // Flip every 6s
            flipInterval = setInterval(() => {
                setFlipped((prev) => {
                    if (!prev && anno.length > ITEMS_PER_PAGE && currentIndex + ITEMS_PER_PAGE >= anno.length) {
                        return false;
                    }
                    return !prev;
                });
            }, 6000);

            // After showing both sides (12s), go to next 8 items
            indexUpdateInterval = setInterval(() => {
                setCurrentIndex((prev) => {
                    const nextIndex = prev + PAGE_SIZE;
                    return nextIndex >= anno.length ? 0 : nextIndex;
                });
            }, 12000);
        }

        return () => {
            clearInterval(flipInterval);
            clearInterval(indexUpdateInterval);
        };
    }, [hovered, anno.length, currentIndex]);

    const handleManualFlip = (direction) => {
        const chunkCount = Math.ceil(anno.length / ITEMS_PER_PAGE);
        if (chunkCount === 0) {
            return;
        }

        if (chunkCount === 1) {
            setFlipped((prev) => !prev);
            return;
        }

        const currentChunkStart = currentIndex + (flipped ? ITEMS_PER_PAGE : 0);
        const currentChunkIndex = Math.floor(currentChunkStart / ITEMS_PER_PAGE);
        const offset = direction === "next" ? 1 : -1;
        const nextChunkIndex = (currentChunkIndex + offset + chunkCount) % chunkCount;
        const nextChunkStart = nextChunkIndex * ITEMS_PER_PAGE;

        setCurrentIndex(Math.floor(nextChunkStart / PAGE_SIZE) * PAGE_SIZE);
        setFlipped(nextChunkStart % PAGE_SIZE >= ITEMS_PER_PAGE);
    };

    const getItems = (arr, start, count) => {
        if (!arr?.length) return [];
        return arr.slice(start, start + count);
    };
        
    const frontItems = anno.length <= ITEMS_PER_PAGE
        ? anno
        : getItems(anno, currentIndex, ITEMS_PER_PAGE);

    const backItems = anno.length <= ITEMS_PER_PAGE
        ? anno
        : getItems(anno, currentIndex + ITEMS_PER_PAGE, ITEMS_PER_PAGE);


    return (
        <div className="news-container bg-prim dark:bg-drkp text-text dark:text-drkt font-popp mt-4 w-full">
            <div className="announcement-wrapper flex flex-col md:flex-row w-full min-h-[50vh]">
                {/* Image Section */}
                <div className="image-section hidden md:block md:w-[40%] lg:w-[30%] relative">
                    <div className="image-overlay"></div>
                    <img className="college-image" src={img1} alt="college"/>
                </div>

                {/* Nominations Section */}
                <div className="nominations-section w-full md:w-[55%] lg:w-[35%] px-4 md:px-0">
                    {spc?.map((item) => (
                        <div key={item.title} className="mb-4">
                            <h2 className="lan-section-title">{item.title}</h2>
                            <p className="section-content">{item.content}</p>
                        </div>
                    ))}
                    <ul className="awards-list">
                        {content?.map((item, index) => (
                            <li className="award-item" key={index}>
                                <img className="award-icon" src={star} alt="Trophy"/>
                                <a href={links[index]} className="award-link" target="_blank" rel="noopener noreferrer">
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Announcements Card */}
                <div className="announcements-card w-[200px] md:w-[200px] lg:w-[25%] px-4 md:px-0">
                    <div className="card-container"
                         onMouseEnter={() => setHovered(true)}
                         onMouseLeave={() => setHovered(false)}>
                        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                            
                            {/* FRONT SIDE */}
                            <div className="card-front overflow-y-auto">
                                <h2 className="card-title">Announcements</h2>
                                <div className="announcements-content">
                                    {frontItems.length === 0 ? (
                                        <p className="announcement-item">
                                            {anno.length === 0 ? "No announcements available." : "No announcements on this page."}
                                        </p>
                                    ) : frontItems.map((item, i) => (
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
                                    <button className="flip-btn" onClick={() => handleManualFlip("prev")}> ↺</button>
                                    <button className="flip-btn" onClick={() => handleManualFlip("next")}> ↻</button>
                                </div>
                            </div>
                            
                            {/* BACK SIDE */}
                            <div className="card-back overflow-y-auto">
                                <h2 className="card-title">Announcements</h2>
                                <div className="announcements-content">
                                    {backItems.length === 0 ? (
                                        <p className="announcement-item">
                                            {anno.length === 0 ? "No announcements available." : "No announcements on this page."}
                                        </p>
                                    ) : backItems.map((item, i) => (
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
                                    <button className="flip-btn" onClick={() => handleManualFlip("prev")}> ↺</button>
                                    <button className="flip-btn" onClick={() => handleManualFlip("next")}> ↻</button>
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