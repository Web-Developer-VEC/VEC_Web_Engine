import React, {useState, useEffect} from "react";
import axios from "axios";
import "./announcements.css";
import img1 from "../Assets/hostel.png";
import star from "../Assets/championship.gif";

const Announcements1 = ({ anno, spc}) => {
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
            }, 6250); // Flip every 6250 ms

            indexUpdateInterval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 8) % anno?.length);
            }, 12700); // Update index every 12700 ms
        }

        return () => {
            clearInterval(flipInterval);
            clearInterval(indexUpdateInterval);
        };
    }, [hovered, anno?.length]);

    // Manual Flip Function
    const handleManualFlip = () => {
        setFlipped((prev) => !prev);
    };

    return (
        // mb-[75vh] lg:mb-[27.5vmin]
        <div className="news bg-prim dark:bg-drkp text-text dark:text-drkt font-popp mt-4">
            {/*<p className="text-xl text-amber-600 ml-6">News</p>*/}
            <div className="relative announcement md:flex flex-wrap gap-y-4 flex-row min-h-[50lvh] w-full">
                <div className="relative blur-lg hidden md:block md:blur-0 basis-full md:basis-1/2 lg:basis-1/3
                        min-w-[35%] opacity-[0.45] md:opacity-100">
                    <div className="cont bg-gradient-to-b from-[color-mix(in_srgb,theme(colors.accn)_69%,white)]
                        dark:from-[color-mix(in_srgb,theme(colors.drka)_69%,black)]
                        to-transparent w-[105%] absolute h-full"></div>
                    <img className="img bottom-0 absolute w-[73.5%] h-auto min-h-[90%]" src={img1} alt="college"/>
                </div>

                <div className="main relative md:basis-1/2 lg:basis-1/3 w-full">
                    {spc?.map((item) => (
                        <div key={item.title}>
                            <h2 className="text-3xl text-accn dark:text-drkt">{item.title}</h2>
                            <p className="text-xl">{item.content}</p>
                        </div>
                    ))}
                    <br/>
                    <ul className="list-none">
                        {content?.map((item, index) => (
                            <li className="text-xl mb-2" key={index}>
                                <img className="inline h-10 w-10 mr-2" src={star} alt="Trophy"/>
                                <a href={links[index]} className="text-text dark:text-drkt no-underline" target="_blank">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Announcements Section */}
                <div className="tiles lg:basis-1/4 w-full grow h-[50vh] md:min-h-[55vh]">
                    <div className="relative h-full w-full"
                         onMouseEnter={() => setHovered(true)}
                         onMouseLeave={() => setHovered(false)}>
                        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                            <div className="card-front bg-[linear-gradient(290deg,color-mix(in_srgb,theme(colors.secd)_75%,black),theme(colors.secd),color-mix(in_srgb,theme(colors.secd)_50%,white))]
                                dark:bg-[linear-gradient(290deg,color-mix(in_srgb,theme(colors.drks)_50%,black),theme(colors.drks),color-mix(in_srgb,theme(colors.drks)_50%,white))]">
                                <h2 className='md:text-3xl text-accn dark:text-drkt mb-0'>Announcements</h2>
                                <div className="contentAnn w-full">
                                    {Array.from({length: 4}).map((_, i) => (
                                        <p key={i} className='text-[18px] line-clamp-2 font-medium'>
                                            {anno?.[(currentIndex + i) % anno?.length] && (
                                                <a
                                                href={UrlParser(
                                                    anno?.[(currentIndex + i) % anno?.length].pdf_path ||
                                                    anno?.[(currentIndex + i) % anno?.length].link
                                                  )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-black hover:underline no-underline mt-2"
                                                >
                                                    <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                    {anno?.[(currentIndex + i) % anno?.length].announcement_name}
                                                </a>
                                            )}
                                        </p>
                                    ))}
                                </div>
                                <button className="absolute flip-btn bottom-0 left-3 text-3xl"
                                        onClick={handleManualFlip}> &#8617;</button>
                                <button className="absolute flip-btn bottom-0 right-3 text-3xl"
                                        onClick={handleManualFlip}> &#8618;</button>
                            </div>
                            <div className="card-back bg-[linear-gradient(290deg,color-mix(in_srgb,theme(colors.secd)_75%,black),theme(colors.secd),color-mix(in_srgb,theme(colors.secd)_50%,white))]
                                dark:bg-[linear-gradient(290deg,color-mix(in_srgb,theme(colors.drks)_75%,black),theme(colors.drks),color-mix(in_srgb,theme(colors.drks)_75%,white))]">
                                <h2 className='text-3xl text-accn dark:text-drkt mb-0'>Announcements</h2>
                                <div className="contentAnn w-full">
                                    {Array.from({length: 4}).map((_, i) => (
                                        <p key={i} className='text-[18px] line-clamp-2 font-medium'>
                                            {anno?.[(currentIndex + i) % anno?.length] && (
                                                <a
                                                    href={UrlParser(
                                                        anno?.[(currentIndex + i) % anno?.length].pdf_path ||
                                                        anno?.[(currentIndex + i) % anno?.length].link
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-black hover:underline no-underline mt-2"
                                                >
                                                    <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                    {anno?.[(currentIndex + i) % anno?.length].announcement_name}
                                                </a>
                                            )}
                                        </p>
                                    ))}
                                </div>
                                <button className="absolute flip-btn bottom-0 left-3 text-3xl"
                                        onClick={handleManualFlip}> &#8617;</button>
                                <button className="absolute flip-btn bottom-0 right-3 text-3xl"
                                        onClick={handleManualFlip}> &#8618;</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcements1;
