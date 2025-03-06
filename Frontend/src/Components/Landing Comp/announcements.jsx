import React, {useState, useEffect} from "react";
import axios from "axios";
import "./announcements.css";
import img1 from "../Assets/hostel.png";
import star from "../Assets/championship.gif";

const Announcements1 = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [spcannouncements, setSpcAnnouncements] = useState([]);
    const [flipped, setFlipped] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const content = spcannouncements[0]?.list_of_contents || [];
    const links = spcannouncements[0]?.list_of_links || [];

    // Fetching Special Announcements
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/specialannouncements`);
                setSpcAnnouncements(response.data);
            } catch (error) {
                console.error("Error fetching data:", error.message);
            }
        };
        fetchData();
    }, []);

    // Fetching General Announcements
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/announcements`);
                setAnnouncements(response.data);
            } catch (error) {
                console.error("Error fetching data:", error.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let flipInterval;
        let indexUpdateInterval;

        if (!hovered) {
            flipInterval = setInterval(() => {
                setFlipped((prev) => !prev);
            }, 6250); // Flip every 6250 ms

            indexUpdateInterval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 8) % announcements.length);
            }, 12700); // Update index every 12700 ms
        }

        return () => {
            clearInterval(flipInterval);
            clearInterval(indexUpdateInterval);
        };
    }, [hovered, announcements.length]);

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
                    {spcannouncements.map((item) => (
                        <div key={item.title}>
                            <h2 className="text-3xl text-accn dark:text-drka">{item.title}</h2>
                            <p className="text-xl">{item.content}</p>
                        </div>
                    ))}
                    <br/>
                    <ul className="list-none">
                        {content?.map((item, index) => (
                            <li className="text-xl mb-2" key={index}>
                                <img className="inline h-10 w-10 mr-2" src={star} alt="Trophy"/>
                                <a href={links[index]} className="text-black no-underline">{item}</a>
                            </li>
                        ))}
                    </ul>
                    {/* <button className="hover:animate-[AnimationName_3s_ease-out_infinite]">Apply Now</button> */}
                </div>

                {/* Announcements Section */}
                <div className="tiles lg:basis-1/4 w-full grow h-[50vh] md:min-h-[55vh]">
                    <div className="relative h-full w-full"
                         onMouseEnter={() => setHovered(true)}
                         onMouseLeave={() => setHovered(false)}>
                        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                            <div className="card-front bg-[linear-gradient(290deg,color-mix(in_srgb,theme(colors.secd)_75%,black),theme(colors.secd),color-mix(in_srgb,theme(colors.secd)_50%,white))]
                                dark:bg-[linear-gradient(290deg,color-mix(in_srgb,theme(colors.drka)_50%,black),theme(colors.drka),color-mix(in_srgb,theme(colors.drka)_50%,white))]">
                                <h2 className='md:text-3xl text-accn dark:text-drks mb-0'>Announcements</h2>
                                <div className="contentAnn w-full">
                                    {Array.from({length: 7}).map((_, i) => (
                                        <h4 key={i} className='text-xl line-clamp-2'>
                                            {announcements[(currentIndex + i) % announcements.length] && (
                                                <a
                                                    href={announcements[(currentIndex + i) % announcements.length].pdf_path || announcements[(currentIndex + i) % announcements.length].link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-black hover:underline no-underline"
                                                >
                                                    <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                    {announcements[(currentIndex + i) % announcements.length].announcement_name}
                                                </a>
                                            )}
                                        </h4>
                                    ))}
                                </div>
                            </div>
                            <div className="card-back bg-[linear-gradient(290deg,color-mix(in_srgb,theme(colors.secd)_75%,black),theme(colors.secd),color-mix(in_srgb,theme(colors.secd)_50%,white))]
                                dark:bg-[linear-gradient(290deg,color-mix(in_srgb,theme(colors.drka)_75%,black),theme(colors.drka),color-mix(in_srgb,theme(colors.drka)_75%,white))]">
                                <h2 className='text-3xl text-accn dark:text-drks mb-0'>Announcements</h2>
                                <div className="contentAnn w-full">
                                    {Array.from({length: 7}).map((_, i) => (
                                        <h4 key={i} className='text-xl line-clamp-2'>
                                            {announcements[(currentIndex + i) % announcements.length] && (
                                                <a
                                                    href={announcements[(currentIndex + i) % announcements.length].pdf_path || announcements[(currentIndex + i) % announcements.length].link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-black hover:underline no-underline"
                                                >
                                                    <i className="fa-solid fa-right-to-bracket mr-1"></i>
                                                    {announcements[(currentIndex + i) % announcements.length].announcement_name}
                                                </a>
                                            )}
                                        </h4>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button className="absolute flip-btn bottom-0 left-3 text-3xl"
                                onClick={handleManualFlip}> &#8617;</button>
                        <button className="absolute flip-btn bottom-0 right-3 text-3xl"
                                onClick={handleManualFlip}> &#8618;</button>
                    </div>

                    {/* Flip Control Buttons */}
                </div>
            </div>
        </div>
    );
};

export default Announcements1;
