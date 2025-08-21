import React, { useEffect, useState } from 'react';
import { FaLink } from 'react-icons/fa';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp'
import axios from 'axios';
import ScrollToTopButton from '../../ScrollToTopButton';
import { useNavigate } from "react-router";
import AbtYear from './Abtyear';

const AbtUs = ({ theme, toggle }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();
    const openInNewTab = (url) => {
    window.open(url, "_blank");
  };
    const [loading, setLoading] = useState({
        img1: true,
        img2: true,
        img3: true
    });
    const [AbtUsData, setAbtsUcData] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);

    const handleLoad = (imgKey) => {
        setLoading(prevState => ({ ...prevState, [imgKey]: false }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.post('/api/main-backend/about_us', {
                    type: "about_vec"
                });
                const data = responce.data.data;
                setAbtsUcData(data);
            } catch (error) {
                console.error("Error fetching about us data", error);
                if (error.response?.data?.status === 429) {
                    navigate('/ratelimit', { state: { msg: error.response.data.message } })
                }
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
                <LoadComp txt={"You are offline"} />
            </div>
        );
    }

    const secTtl = "Velammal Engineering College";
    const secSub = "An Autonomous Institution";
    const secCnt = "We stand for innovation, with our diverse community of scholars and engineers dedicated to making a positive impact at local, national, and global levels.";

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    const closeModal = () => setSelectedPdf(null);

    return (
        <>
            <Banner
                toggle={toggle}
                theme={theme}
                backgroundImage="./Banners/aboutvec.webp"
                headerText="About VEC"
                subHeaderText="A center for academic excellence and innovation, nurturing minds to create a brighter future through education and empowerment."
            />

            {AbtUsData ? (
                <>
                    <div className='flex m-8'>
                        <div className='flex relative w-full max-h-[100vh]'>
                            <div className="relative grow p-4 font-[Poppins] mt-14 basis-3/4 z-10 bg-[#ffffffa] backdrop-blur-[16px] lg:bg-none lg:backdrop-blur-0 rounded-xl">
                                <p className='text-[32px] text-center font-[Poppins]'>{secTtl}</p>
                                <p className='text-[24px] font-bold text-accn dark:text-drkt  text-center font-[Poppins]'>{secSub}</p>
                                <p className="text-[16px] text-center mt-4 text-justify font-[Poppins]">{secCnt}</p>
                            </div>

                            <div className="absolute lg:relative w-[110vw] h-[40vh] left-[-16vw] top-[20%] lg:left-0 lg:top-10 md:opacity-0 opacity-30 lg:opacity-100">
                                {/* Image 1 */}
                                <div className="absolute w-[40%] h-[65%] right-[15%]">
                                    {loading.img1 && (
                                        <div className="absolute inset-0 flex justify-center items-center">
                                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <img
                                        className={`absolute w-full h-full rounded-tl-[3rem] rounded-br-[3rem] transition-opacity duration-500 ${loading.img1 ? 'opacity-0' : 'opacity-100'}`}
                                        src={UrlParser(AbtUsData?.image_path[0])}
                                        alt="Banner Image0"
                                        onLoad={() => handleLoad('img1')}
                                    />
                                </div>

                                {/* Image 2 */}
                                <div className="absolute w-[40%] h-[90%] left-[15%] top-[10%] border-[2vmin] border-prim dark:border-drkp">
                                    {loading.img2 && (
                                        <div className="absolute inset-0 flex justify-center items-center">
                                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <img
                                        className="absolute w-[80%] h-[80%] md:w-full md:h-full rounded-tr-[2rem] md:rounded-tr-[3rem] rounded-bl-[2rem] md:rounded-bl-[3rem] transition-opacity duration-500 opacity-100"
                                        src={UrlParser(AbtUsData?.image_path[1])}
                                        alt="Banner Image1"
                                        onLoad={() => handleLoad('img2')}
                                    />
                                </div>

                                {/* Image 3 */}
                                <div className="absolute w-[25%] h-[40%] left-[40%] top-[45%] border-[2vmin] border-prim dark:border-drkp">
                                    {loading.img3 && (
                                        <div className="absolute inset-0 flex justify-center items-center">
                                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <img
                                        className={`absolute w-full h-full rounded-tl-[3rem] rounded-br-[3rem] transition-opacity duration-500 ${loading.img3 ? 'opacity-0' : 'opacity-100'}`}
                                        src={UrlParser(AbtUsData?.image_path[2])}
                                        alt="Banner Image2"
                                        onLoad={() => handleLoad('img3')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-8 p-10 transition-all duration-300 ease-in-out">
                        <div className="flex flex-col justify-center px-2 lg:px-12">
                            <p className="text-[16px] lg:text-[16px] text-justify font-[Poppins] leading-relaxed tracking-wide">
                                {AbtUsData?.content}
                            </p>
                        </div>
                    </div>

                        <div className='m-2 p-2 font-[Poppins]'>
                        <div className='pdf-links grid grid-cols-1 md:grid-cols-1 md:flex flex-wrap justify-center gap-6 w-fit mx-auto text-left'>
                            {[
                                "AICTE Approval",
                                "University Affiliation",
                                "Governing Body",
                                "Mandatory Disclosures",
                            ].map((label, index) => (
                           <div
                                    key={index}
                                    onClick={() => {
                                        const url = AbtUsData?.links[index];
                                        if (window.innerWidth <= 600) {
                                            window.open(UrlParser(url), "_blank");
                                        } else {
                                            // setSelectedPdf({ url: UrlParser(url), name: label });
                                            window.open(UrlParser(url), "_blank");
                                        }
                                    }}
                                    className='cursor-pointer md:px-1 md:py-1 md:text-[16px] flex items-center justify-center px-3 py-3 rounded-xl bg-secd hover:bg-accn text-text dark:text- hover:text-drkt'
                                >
                                    {label}
                                </div>
                        ))}
                        <button
                        onClick={() => navigate("/abt-yr")} 
                        className='cursor-pointer md:px-1 md:py-1 md:text-[16px] flex items-center justify-center px-3 py-3 rounded-xl bg-secd hover:bg-accn text-text dark:text- hover:text-drkt'>AISHE</button>
                        </div>
                        </div>
                </>
            ) : (
                <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
                    <LoadComp txt={""} />
                </div>
            )}

            {/* PDF Modal for tablet/desktop */}
            {selectedPdf && (
                <div className="pdf-modal">
                    <div className="pdf-modal-content">
                        <button className="pdf-close-button" onClick={closeModal}>X</button>
                        <h2>{selectedPdf.name}</h2>
                        <iframe
                            src={selectedPdf.url}
                            title={selectedPdf.name}
                            className="pdf-iframe"
                        ></iframe>
                    </div>
                </div>
            )}

            <ScrollToTopButton />
        </>
    );
};

export default AbtUs;
