import React, {useEffect, useState, useRef} from 'react';
import Vide from './Assets/stock.mp4';
import College from './Assets/Hell.png';

const ImgSld = () => {
    // const [vid, setVid] = useState("bottom-[0vh]");
    const videoRef1 = useRef(null); // Reference for the background video
    const videoRef2 = useRef(null); // Reference for the second video

    const lst = [
        'Welcome to VEC - Empowering Future Leaders',
        'Explore Our World-Class Facilities and Programs',
        'Join Us in Shaping the Future Through Innovation and Education',
        'Discover Opportunities for Personal and Academic Growth',
        'Get Involved: Clubs, Events, and More at VEC',
    ];
    // const lst1 = [...lst, ...lst]

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
        const pos_thresh = 300;
        console.log(pos);

        if (pos > pos_thresh) {
            // Pause video when scrolled past threshold
            if (videoRef1.current) videoRef1.current.pause();
            // setVid("bottom-[0vmax]");
        } else {
            // Play video when scrolled above threshold
            if (videoRef1.current) videoRef1.current.play();
            // setVid("bottom-[35vmax]");
        }
    }, 100); // Adjust the debounce time as needed

    useEffect(() => {
        window.addEventListener('scroll', hndlScrll, {passive: true});

        return () => {
            window.removeEventListener('scroll', hndlScrll);
        };
    }, []);

    return (
        <div className='w-[500%]'>
            <div className="flex h-[35vmax] top-[15vmax] bg-center relative justify-items-stretch bg-transparent w-[100vw]">
                <video
                    className='min-h-[50vmax] w-full bg-center fixed top-0 z-10'
                    autoPlay loop muted ref={videoRef1} id='BgVid'
                    playsInline>
                    <source src={Vide} type='video/mp4'/>
                </video>

                <div className='absolute font-popp text-[1.5vmax] max-w-[50vmax] lg:right-[1vmax] right-[5vmax]
                    pointer-events-none overflow-hidden'>
                    <div className='relative no-wrap h-[15vmax] w-[35vmax] overflow-hidden'>
                        {lst.map((elm, i) => (
                            <p className={`absolute z-20 min-w-[20vmax] max-w-[30vmax] translate-x-[-40vmax] 
                                animate-[LslideIn_40s_ease-in_infinite] p-5 border-y-2 
                                [border-image:linear-gradient(to_right,#d96402,#efa249,#d96402)_1] 
                                bg-[#0000001a] backdrop-blur-[0px] text-white text-[1.7vmax]`}
                               style={{animationDelay: `${i * 7}s`}}
                               key={i}
                            >
                                {elm}
                            </p>
                        ))}
                    </div>
                </div>

                {/*<video className={`h-[50vh] w-auto bg-cover fixed ${vid} z-0`}*/}
                {/*    ref={videoRef2} muted playsInline>*/}
                {/*    <source src={Vide} type='video/mp4'/>*/}
                {/*</video>*/}
                <img alt="Hell on earth" src={College} className={`h-[100vh] w-auto bg-cover bottom-0 fixed z-0`}/>
            </div>
        </div>
    );
};

export default ImgSld;
