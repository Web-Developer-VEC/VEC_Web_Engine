
import React, {useEffect, useRef, useState} from 'react';

import College from '../Assets/Hell.png';
import Toggle from "../Toggle";

const ImgSld = ({load, toggle, theme, lst, ph, email}) => {
    const videoRef = useRef(null);

    // Debounce function to limit how often the scroll event is processed
    const debounce = (func, wait = 100) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const hndlScrll = debounce(() => {
        const pos = window.scrollY;
        const pos_thresh = 600;

        if (pos > pos_thresh) {
            // Pause video when scrolled past threshold
            if (videoRef.current) videoRef.current.pause();
            // setVid("bottom-[0vmax]");
        } else {
            // Play video when scrolled above threshold
            if (videoRef.current) videoRef.current.play();
            // setVid("bottom-[35vmax]");
        }
    }, 100); // Adjust the debounce time as needed

    // state to store the current random 7 items
    const [displayItems, setDisplayItems] = useState([]);

    // helper to pick 7 random items from lst
    const pickRandom7 = () => {
        if (!lst || lst.length <= 7) return lst; // if less than 7, just return all
        const shuffled = [...lst].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 6);
    };

    useEffect(() => {
        // initial pick
        setDisplayItems(pickRandom7());

        // after each animation cycle (50s in your css), pick new 7
        const interval = setInterval(() => {
        setDisplayItems(pickRandom7());
        }, 50000); // 50 seconds = your animation duration

        return () => clearInterval(interval);
    }, [lst]);

    useEffect(() => {
        window.addEventListener('scroll', hndlScrll, {passive: true});
        const video = videoRef.current;

        const handleCanPlayThrough = () => {
            console.log("Can play through");
            load()
        };

        if (video) {
            video.addEventListener('loadstart', handleCanPlayThrough);
        }

        return () => {
            if (video) {
                video.removeEventListener('canplaythrough', handleCanPlayThrough);
            }
            window.removeEventListener('scroll', hndlScrll);
        };
    }, [hndlScrll]);

    const containerRef = useRef(null);

    useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e) => {
        e.preventDefault(); // stop the scroll
        e.stopPropagation();
    };

    container.addEventListener('wheel', onWheel, { passive: false }); // must set passive:false for preventDefault to work
    return () => container.removeEventListener('wheel', onWheel);
    }, []);

    const toggleRef = useRef(null);

    useEffect(() => {
    const toggleEl = toggleRef.current;
    if (!toggleEl) return;

    const handleWheel = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Add the listener with passive:false
    toggleEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
        toggleEl.removeEventListener('wheel', handleWheel);
    };
    }, []);


    return (
        <div className='landing-banner'>
            <div className="flex h-[30vh] md:h-[25vh] lg:h-[65vh] top-[15vmax] bg-center relative justify-items-stretch bg-transparent
                w-[100vw] pointer-events-auto">
                <video
                    className='min-h-[50vmax] w-full bg-center fixed -top-12 z-10'
                    autoPlay loop muted ref={videoRef} id='BgVid'
                    playsInline>
                    <source src={"./Banners/Vid_banner/Landing_page_draft.mp4"} type='video/mp4'/>
                </video>
                <div className="absolute flex gap-3 z-[50] bottom-[50%] md:bottom-[60%] lg:bottom-[50%] left-0 mb-3 ml-3 md:w-[550px] pointer-events-auto"
                    ref={containerRef}
                >
                    <button onClick={() => window.location.href = `tel:${ph}`}   onWheel={(e) => {
                            e.stopPropagation();
                            e.preventDefault(); // This is what actually blocks scrolling
                        }}
                        className="bg-prim dark:bg-drkp rounded-full px-3 py-1 lg:py-2 lg:px-3 outline outline-prim
                        dark:outline-drkp outline-offset-2 hover:outline-secd dark:hover:outline-drks bg-[length:200%_100%]
                        bg-[position:0%_100%] text-[1lvh] lg:text-lg text-text dark:text-white bg-gradient-to-l from-secd
                        dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% border-slate-700 w-full
                        duration-[150ms] ease-in transition-all hover:bg-[position:-100%_100%]  overflow-hidden">
                        {ph}
                    </button>

                    <button onClick={() => window.open(`mailto:${email}`, '_blank')}   onWheel={(e) => {
                            e.stopPropagation();
                            e.preventDefault(); // This is what actually blocks scrolling
                        }}
                        className="bg-prim dark:bg-drkp rounded-full px-3 py-1 lg:py-2 lg:px-3 outline outline-prim
                        dark:outline-drkp outline-offset-2 hover:outline-secd dark:hover:outline-drks bg-[length:200%_100%]
                        bg-[position:0%_100%] text-[1lvh] lg:text-lg text-text dark:text-white bg-gradient-to-l from-secd
                        dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% border-slate-700 w-full
                        duration-[150ms] ease-in transition-all hover:bg-[position:-100%_100%] overflow-hidden">
                        {email}
                    </button>
                </div>
                <div ref={toggleRef}>
                    <Toggle toggle={toggle} theme={theme} attr={"absolute -top-[27%] h-12 w-[11%] bg-[#0000001a] backdrop-blur-[4px] rounded-br-xl"} />
                </div>
                <div className='absolute font-popp text-[1.5vmax] max-w-[50vmax] -top-12 md:-top-28 -right-5 lg:right-[1vmax]
                    pointer-events-none overflow-hidden'>
                    <div className='relative no-wrap h-[15vh] md:h-[10vmax] w-[35vmax] mt-4 pointer-events-none overflow-hidden'>
                        {displayItems?.map((elm, i) => (
                            <p
                                key={i}
                                className={`absolute z-20 min-w-[20vmax] max-w-[30vmax] h-[70%] md:h-full translate-x-[-40vmax] 
                                animate-[LslideIn_50s_ease-in_infinite] px-4 py-[4vw] border-y-2 
                                lg:line-clamp-none line-clamp-2
                                [border-image:linear-gradient(to_right,theme(colors.secd),theme(colors.accn),theme(colors.secd))_1]
                                dark:[border-image:linear-gradient(to_right,theme(colors.drks),theme(colors.drka),theme(colors.drks))_1]
                                bg-[#0000001a] backdrop-blur-[0px] text-white text-[125%]`}
                                style={{ animationDelay: `${i * 8}s` }}
                            >
                                <span className="font-bold text-secd dark:text-drka block text-[12px] md:text-2xl leading-tight">
                                    {elm.header}
                                </span>
                                <span className="text-[10px] md:text-[16px] leading-snug">
                                    {elm.message}
                                </span>
                            </p>
                        ))}
                    </div>
                </div>

                <img alt="Hell on earth" src={College} className={`h-[100vh] w-auto bg-cover bottom-0 fixed z-0`}/>
            </div>
        </div>
    );
};

export default ImgSld;
