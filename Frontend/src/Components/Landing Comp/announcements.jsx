import React, {useState, useEffect} from "react";
import "./announcements.css";
import img1 from "../Assets/hostel.png";
import star from "../Assets/championship.gif";

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

    useEffect(() => {
        let flipInterval;
        let indexUpdateInterval;

        if (!hovered) {
            flipInterval = setInterval(() => {
                setFlipped((prev) => !prev);
            }, 6250);

            indexUpdateInterval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 8) % anno?.length);
            }, 12700);
        }

        return () => {
            clearInterval(flipInterval);
            clearInterval(indexUpdateInterval);
        };
    }, [hovered, anno?.length]);

    const handleManualFlip = () => {
        setFlipped((prev) => !prev);
    };

    return (
        <div className="news-container bg-prim dark:bg-drkp text-text dark:text-drkt font-popp mt-4 w-full">
            <div className="announcement-wrapper flex flex-col md:flex-row w-full min-h-[50vh]">
                {/* Image Section - Hidden on mobile */}
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

                {/* Announcements Section */}
                <div className="announcements-card w-[200px] md:w-[200px] lg:w-[25%] px-4 md:px-0">
                    <div className="card-container"
                         onMouseEnter={() => setHovered(true)}
                         onMouseLeave={() => setHovered(false)}>
                        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                            <div className="card-front overflow-y-auto">
                                <h2 className="card-title">Announcements</h2>
                                <div className="announcements-content">
                                    {Array.from({length: 4}).map((_, i) => (
                                        <p key={i} className="announcement-item">
                                            {anno?.[(currentIndex + i) % anno?.length] && (
                                                <a
                                                    href={UrlParser(
                                                        anno?.[(currentIndex + i) % anno?.length].pdf_path ||
                                                        anno?.[(currentIndex + i) % anno?.length].link
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="announcement-link text-left"
                                                >
                                                    <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                    {anno?.[(currentIndex + i) % anno?.length].announcement_name}
                                                </a>
                                            )}
                                        </p>
                                    ))}
                                </div>
                                <div className="flip-buttons">
                                    <button className="flip-btn" onClick={handleManualFlip}> ↻</button>
                                    <button className="flip-btn" onClick={handleManualFlip}> ↺</button>
                                </div>
                            </div>
                            <div className="card-back overflow-y-auto">
                                <h2 className="card-title">Announcements</h2>
                                <div className="announcements-content">
                                    {Array.from({length: 4}).map((_, i) => (
                                        <p key={i} className="announcement-item">
                                            {anno?.[(currentIndex + i) % anno?.length] && (
                                                <a
                                                    href={UrlParser(
                                                        anno?.[(currentIndex + i) % anno?.length]?.pdf_path ||
                                                        anno?.[(currentIndex + i) % anno?.length]?.link
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="announcement-link text-left"
                                                >
                                                    <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                    {anno?.[(currentIndex + i) % anno?.length].announcement_name}
                                                </a>
                                            )}
                                        </p>
                                    ))}
                                </div>
                                <div className="flip-buttons">
                                    <button className="flip-btn" onClick={handleManualFlip}> ↻</button>
                                    <button className="flip-btn" onClick={handleManualFlip}> ↺</button>
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