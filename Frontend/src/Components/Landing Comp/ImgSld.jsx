import React, {useEffect, useRef} from 'react';
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

    return (
        <div className='landing-banner'>
            <div className="flex h-[30vh] md:h-[45vmax] top-[15vmax] bg-center relative justify-items-stretch bg-transparent
                w-[100vw] pointer-event-none">
                <video
                    className='min-h-[50vmax] w-full bg-center fixed -top-12 z-10'
                    autoPlay loop muted ref={videoRef} id='BgVid'
                    playsInline>
                    <source src={"./Banners/Vid_banner/Landing_page_draft.mp4"} type='video/mp4'/>
                </video>
                <div className="absolute flex gap-3 z-[50] bottom-[50%] md:bottom-[38%] left-0 mb-3 ml-3">
                    <button onClick={() => window.location.href = `${ph}`}
                        className="bg-prim dark:bg-drkp rounded-full px-3 py-1 lg:py-2 lg:px-3 outline outline-prim
                        dark:outline-drkp outline-offset-2 hover:outline-secd dark:hover:outline-drks bg-[length:200%_100%]
                        bg-[position:0%_100%] text-[1lvh] lg:text-lg text-text dark:text-white bg-gradient-to-l from-secd
                        dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% border-slate-700 w-full
                        duration-[150ms] ease-in transition-all hover:bg-[position:-100%_100%]">
                        {ph}
                    </button>

                    <button onClick={() => window.open(`mailto:${email}`, '_blank')}
                        className="bg-prim dark:bg-drkp rounded-full px-3 py-1 lg:py-2 lg:px-3 outline outline-prim
                        dark:outline-drkp outline-offset-2 hover:outline-secd dark:hover:outline-drks bg-[length:200%_100%]
                        bg-[position:0%_100%] text-[1lvh] lg:text-lg text-text dark:text-white bg-gradient-to-l from-secd
                        dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% border-slate-700 w-full
                        duration-[150ms] ease-in transition-all hover:bg-[position:-100%_100%]">
                        {email}
                    </button>
                </div>
                <Toggle toggle={toggle} theme={theme}
                        attr="absolute -top-[25%] lg:-top-[19%] h-12 w-[11%] bg-[#0000001a] backdrop-blur-[4px]
                        rounded-br-xl"/>
                {/*<div className='relative flex gap-2  mt-2  px-2 py-2 z-[50]*/}
                {/*    '>*/}
                <div className='absolute font-popp text-[1.5vmax] max-w-[50vmax] -top-12 -right-5 lg:right-[1vmax]
                    pointer-events-none overflow-hidden'>
                    <div className='relative no-wrap h-[15vmax] w-[35vmax] mt-4 pointer-events-none overflow-hidden'>
                        {lst?.map((elm, i) => (
                            <p className={`absolute z-20 min-w-[20vmax] max-w-[30vmax] translate-x-[-40vmax] 
                                animate-[LslideIn_40s_ease-in_infinite] px-4 py-[4vw] border-y-2 line-clamp-2 
                                lg:line-clamp-none 
                                [border-image:linear-gradient(to_right,theme(colors.secd),theme(colors.accn),theme(colors.secd))_1] 
                                dark:[border-image:linear-gradient(to_right,theme(colors.drks),theme(colors.drka),theme(colors.drks))_1] 
                                bg-[#0000001a] backdrop-blur-[0px] text-white text-[125%]`}
                               style={{animationDelay: `${i * 7}s`}}
                               key={i}>{elm.message}
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
