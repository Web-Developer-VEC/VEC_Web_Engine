import React, { useEffect, useState } from 'react';
import { FaLink } from 'react-icons/fa';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp'
import styles from './AbtUs.css';

const AbtUs = ({ theme, toggle }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [loading, setLoading] = useState({
        img1: true,
        img2: true,
        img3: true
    });

    const handleLoad = (imgKey) => {
        setLoading(prevState => ({ ...prevState, [imgKey]: false }));
    };

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
    const sec2Cnt = "Velammal Engineering College (Autonomous) is affiliated to Anna University and is approved by the All India Council for Technical Education (AICTE). The institution was certified ISO 9001:2015 by M/s. TUV, India in just 5 years of its inception. The college is accredited by NAAC and all eligible programmes are accredited by NBA. Based in Chennai city, VEC, the safe campus, offers a truly unrivalled study experience with various courses, outstanding facilities, comprehensive support, and highly disciplined life.Velammal Engineering College achieved its autonomous status in the year 2019. Autonomy can be found in the choice of curriculum, pedagogy, and evaluation systems. It helps students to carve a niche for themselves as they have greater flexibility towards academic development for improvement of academic standards and excellence.";
    
    const lis = [sec2Cnt ];

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    return (
        <>
            <Banner toggle={toggle} theme={theme}
                backgroundImage="./Banners/aboutvec.webp"
                headerText="About VEC"
                subHeaderText="A center for academic excellence and innovation, nurturing minds to create a brighter future through education and empowerment."
            />

            <div className='flex m-8'>
                <div className='flex relative w-full max-h-[100vh]'>
                    <div className="relative grow p-4 font-[Poppins] mt-14 basis-3/4 z-10
                        bg-[#ffffffa] backdrop-blur-[16px] lg:bg-none lg:backdrop-blur-0 rounded-xl">
                        
                        <p className='text-3xl text-center font-[Poppins]'>{secTtl}</p>
                        <p className='text-[20px] font-bold text-accn dark:text-drkt text-center font-[Poppins]'>{secSub}</p>
                        <p className="text-[16px] text-center mt-4 text-justify font-[Poppins]">{secCnt}</p>
                    </div>
                    
                    <div className="absolute lg:relative w-[110vw] h-[40vh] left-[-20vw] top-[20%] lg:left-0 lg:top-10
                        opacity-30 lg:opacity-100">
                        {/* Image 1 */}
                        <div className="absolute w-[40%] h-[65%] right-[15%]">
                            {loading.img1 && (
                                <div className="absolute inset-0 flex justify-center items-center">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent 
                                                    rounded-full animate-spin"></div>
                                </div>
                            )}
                            <img className={`absolute w-full h-full rounded-tl-[3rem] rounded-br-[3rem] transition-opacity duration-500 ${loading.img1 ? 'opacity-0' : 'opacity-100'}`}
                                src={UrlParser('/static/images/aboutvec/aboutvec1.webp')}
                                alt="Banner Image0"
                                onLoad={() => handleLoad('img1')}
                            />
                        </div>

                        {/* Image 2 */}
                        <div className="absolute w-[40%] h-[90%] left-[15%] top-[10%] border-[2vmin] border-prim dark:border-drkp">
                            {loading.img2 && (
                                <div className="absolute inset-0 flex justify-center items-center">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent 
                                                    rounded-full animate-spin"></div>
                                </div>
                            )}
                            <img className={`absolute w-full h-full rounded-tr-[3rem] rounded-bl-[3rem] transition-opacity duration-500 ${loading.img2 ? 'opacity-0' : 'opacity-100'}`}
                                src={UrlParser('/static/images/aboutvec/aboutvec2.webp')}
                                alt="Banner Image1"
                                onLoad={() => handleLoad('img2')}
                            />
                        </div>

                        {/* Image 3 */}
                        <div className="absolute w-[25%] h-[40%] left-[40%] top-[45%] border-[2vmin] border-prim dark:border-drkp">
                            {loading.img3 && (
                                <div className="absolute inset-0 flex justify-center items-center">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent 
                                                    rounded-full animate-spin"></div>
                                </div>
                            )}
                            <img className={`absolute w-full h-full rounded-tl-[3rem] rounded-br-[3rem] transition-opacity duration-500 ${loading.img3 ? 'opacity-0' : 'opacity-100'}`}
                                src={UrlParser('/static/images/aboutvec/aboutvec3.webp')}
                                alt="Banner Image2"
                                onLoad={() => handleLoad('img3')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {lis.map((itm, index) => (
                <div key={index} className="flex gap-8 my-14 
                    p-10 transition-all duration-300 ease-in-out">
                    
                    <div className="flex flex-col justify-center px-2 lg:px-12">
                        <p className="text-[16px] lg:text-[16px] text-justify font-[Poppins]
                        leading-relaxed tracking-wide">
                            {itm}
                        </p>
                    </div>
                </div>
            ))}

            <div className='m-8 p-6'>
                <ul className='pdf-links flex flex-wrap justify-center gap-8' >
                    <li className='text-lg flex items-center gap-'>
                        <FaLink className='text-prim dark:text-drkp' />
                        <a href={UrlParser("/static/pdfs/about_vec/AICTE_EOA_2024-2025.pdf")} target="_blank" rel="noopener noreferrer" className='text-blue-600 dark:text-drka hover:underline'>🔗AICTE Approval</a>
                    </li>
                    <li className='text-lg flex items-center gap-2'>
                        <FaLink className='text-prim dark:text-drkp' />
                        <a href={UrlParser("/static/pdfs/about_vec/AU_Grant_of_Affiliation_2024-25.pdf")} target="_blank" rel="noopener noreferrer" className='text-blue-600 dark:text-drka hover:underline'>🔗University Affiliation</a>
                    </li>
                    <li className='text-lg flex items-center gap-2'>
                        <FaLink className='text-prim dark:text-drkp' />
                        <a href={UrlParser("/static/pdfs/about_vec/4th_Governing_Body_Members.pdf")} target="_blank" rel="noopener noreferrer" className='text-blue-600 dark:text-drka hover:underline'>🔗Governing Body</a>
                    </li>
                    <li className='text-lg flex items-center gap-2'>
                        <FaLink className='text-prim dark:text-drkp' />
                        <a href={UrlParser("/static/pdfs/about_vec/VEC_Mandatory_Disclosure-2024-2025.pdf")} target="_blank" rel="noopener noreferrer" className='text-blue-600 dark:text-drka hover:underline'>🔗Mandatory Disclosures</a>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default AbtUs;
