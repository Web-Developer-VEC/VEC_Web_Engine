import React, {useState, useEffect, useCallback, useRef} from "react";
import Tilt from "react-parallax-tilt";
import {useNavigate} from "react-router-dom";

const Team = ({ani, callSld, ind, urlPrm}) => {
    const ppl = [
        {
            nme: "Alice Wonderland",
            dsc: "A whimsical coder who dreams in CSS and writes poetry in Python. She once built a website that could only be viewed upside down, just to see if it could be done. Her favorite debugging technique involves talking to her rubber duck, Mr. Quackers, who always has the best advice (mostly 'quack').",
            rol: "Software Sorceress", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Bob Builder",
            dsc: "A master of digital construction, Bob can assemble a full-stack application faster than you can say 'npm install.' He believes every bug is just a tiny architectural challenge waiting to be solved, and he approaches each project with the enthusiasm of a kid building a Lego castle.",
            rol: "Digital Architect", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Charlie Chaplin",
            dsc: "A silent but deadly programmer, Charlie's code speaks volumes. He communicates primarily through well-commented functions and the occasional meme in the team chat. He's known for his ability to fix critical bugs with a single keystroke, often while juggling a cup of coffee and a Rubik's Cube.",
            rol: "Code Whisperer", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Diana Dynamo",
            dsc: "A powerhouse of productivity, Diana can launch a new feature before breakfast. She believes in the power of caffeine, clean code, and the Oxford comma. Her spirit animal is a cheetah, and her favorite command is 'git push --force' (use with caution!).",
            rol: "Feature Fiend", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Edward Einstein",
            dsc: "A theoretical coder with a penchant for pondering the universe and its relation to database schemas. He's often found sketching complex algorithms on napkins during lunch. He once proved that time travel is possible, but only within a local development environment.",
            rol: "Algorithm Alchemist", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Fiona Fixit",
            dsc: "The ultimate troubleshooter, Fiona can debug any problem, no matter how obscure. She has a sixth sense for spotting off-by-one errors and a knack for explaining complex technical concepts to anyone, even her pet goldfish, Bubbles.",
            rol: "Bug Bounty Hunter", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "George Gigabyte",
            dsc: "A data wizard who can wrangle terabytes of information like a cowboy wrangles cattle. He believes that every data point has a story to tell, and he's determined to uncover them all, one SQL query at a time. He also makes a mean batch of cookies.",
            rol: "Data Wrangler", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Hannah Hacker",
            dsc: "A security expert with a heart of gold, Hannah protects digital assets from the forces of evil. She can crack any password (ethically, of course) and build firewalls that would make a dragon sweat. She also organizes weekly capture-the-flag competitions for her team.",
            rol: "Cyber Guardian", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Ivan Innovator",
            dsc: "A relentless inventor, Ivan is always pushing the boundaries of what's possible. He dreams of building a self-aware toaster and a robot that can fold laundry. He believes that the only limit is your imagination (and maybe your budget).",
            rol: "Innovation Inventor", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Julia Jester",
            dsc: "A coding comedian, Julia brings laughter to the digital realm. She writes funny comments in her code and creates error messages that make you smile. She believes that programming should be fun, and she's on a mission to prove it.",
            rol: "Code Comedian", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Kevin Keyboard",
            dsc: "A speed typist with a passion for efficiency, Kevin can write code faster than most people can read it. He's a master of keyboard shortcuts and a firm believer in the power of the command line. He also holds the office record for most lines of code written in a single day.",
            rol: "Rapid Coder", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Laura Logic",
            dsc: "A master of logical thinking, Laura can solve any problem with a clear and concise approach. She's a fan of flowcharts, truth tables, and Venn diagrams. She believes that every problem has a logical solution, if you just break it down into smaller pieces.",
            rol: "Logic Luminary", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Mike Maestro",
            dsc: "A conductor of code, Mike orchestrates complex systems with grace and precision. He's a master of design patterns and a believer in the power of modularity. He believes that code should be beautiful, like a symphony.",
            rol: "Code Conductor", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Nancy Navigator",
            dsc: "A user experience guru, Nancy guides users through the digital landscape with ease. She's a master of usability testing and a believer in the power of empathy. She believes that every user should have a delightful experience.",
            rol: "UX Navigator", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Oscar Optimist",
            dsc: "A ray of sunshine in the coding world, Oscar always sees the bright side of things. He believes that every bug is an opportunity to learn and grow. He also organizes weekly team-building activities, like coding karaoke and debugging dodgeball.",
            rol: "Code Cheerleader", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Penny Pixel",
            dsc: "A visual virtuoso, Penny brings digital designs to life with her keen eye for detail. She's a master of CSS and a believer in the power of pixels. She believes that every website should be a work of art.",
            rol: "Design Diva", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Quentin Query",
            dsc: "A database detective, Quentin can find any information hidden in the depths of a database. He's a master of SQL and a believer in the power of data. He believes that every question has an answer, if you know where to look.",
            rol: "Data Detective", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Rachel Runtime",
            dsc: "A performance perfectionist, Rachel optimizes code for maximum efficiency. She's a master of profiling tools and a believer in the power of optimization. She believes that code should be fast and furious.",
            rol: "Performance Pro", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        },
        {
            nme: "Samuel Syntax",
            dsc: "A stickler for syntax, Samuel writes code that is both elegant and error-free. He's a master of coding standards and a believer in the power of consistency. He believes that code should be beautiful and readable.",
            rol: "Syntax Savant", img: '/img_p.png', cov: '/person.jpg', soc: [
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
                {ico: '/linkedin-logo.png', lnk: 'http://SocialSite.org'},
            ]
        }
    ];
    const [pause, setPause] = useState(false);
    const [pos, setPos] = useState((ind > ppl.length)? 1: ind);
    const durToNxt = (ind !== urlPrm)? 10000000: 6900
    const navigate = useNavigate();

    const pos_hdl = useCallback((pvl) => {
        if (pvl !== 0 && pvl <= ppl.length) {
            if(pos < pvl) callSld(1)
            else callSld(2)
            setPos(pvl);
        }
    }, [pos, callSld, ppl]);

    const handleNext = useCallback(() => {
        if (pos !== ppl.length) pos_hdl(pos + 1);
        else pos_hdl(1);
    }, [pos, pos_hdl, ppl.length]);

    useEffect(() => {
        if (!pause) {
            const interval = setInterval(() => {
                handleNext();
            }, durToNxt);

            return () => clearInterval(interval);
        }
    }, [durToNxt, handleNext, pause, pos]);

    return (
        <div className="cursor-pointer">
            {(ind !== urlPrm) ?
                <h3 className={"w-screen bg-blue-500/50 py-2 left-0 text-center text-[1.25rem] font-thin text-slate-300"}>
                    You are viewing <b className="font-bold">{ppl[+(ind) - 1].nme}</b>'s customised view
                    <a className="bg-blue-950 text-[1rem] text-white rounded-xl px-2 py-1 ml-4 mb-1"
                       href="./69">Revert ?</a>
                </h3> : ""}
            <div
                className={`${(ani) ? "animate-[Invis_1.5s_ease_forwards] [animation-delay:0s]"
                    : "hidden"} font-comf row-[1/2] col-[1/8] w-screen lg:w-[45vw] z-1 
                h-[500px] items-center flex justify-center mb-1 lg:left-[18vw] lg:top-[5vh]`}
                style={{transformStyle: 'preserve-3d', perspective: '600px'}}>

                {ppl.map((cur, i) => (
                    <div key={i} className={`group cursor-pointer absolute transition-all duration-[0.25s] ease
                        hover:[transform:rotateY(90deg)] mb-[12vh] lg:mb-0 ${(pos - 5 < i && i < pos + 3) ?
                        'animate-[fadIn_0.1s_ease-in_forwards]' :
                        'animate-[fadOut_0.1s_ease-out_forwards]'}`}
                         style={{
                             transform: `rotateY(${-10 * (pos - (i + 0.69))}deg) translateX(${-20 * (pos - (i + 1))}vmax)`,
                             zIndex: `${Math.max(((pos - (i + 5)) * 2), (pos - i)) - 20}`
                         }}
                         onMouseEnter={() => setPause(pos === i + 1)}
                         onMouseLeave={() => setPause(false)}>

                        <div className={`relative text-center w-[16.9vmax] h-[26vmax] 
                            mb-48 transition-all duration-[2s] ${(pos === i + 1) ? 'focs' : ''} rounded-2xl
                            group my-auto transition-transform`}
                             onClick={() => pos_hdl(i + 1)}>
                            <div className="absolute bg-slate-100 z-[-10] max-w-[100%] w-[40vw] lg:w-[17.5vw]
                                h-[20vmax] lg:h-full rounded-lg
                                overflow-hidden [transform:rotateY(180deg),translateZ(-10px)]">
                                <img className={(pos === i + 1) ? 'hidden' : 'h-full rounded-2xl'} src={"/img_p.png"}
                                     alt={"Person"}/>
                            </div>
                            <Tilt><img
                                className={`${(pos === i + 1) ? 'animate-[sizeUpExt_0.3s_ease-in-out_forwards] ' :
                                    'hidden'} absolute h-[26vmax] -top-8 lg:top-10 origin-bottom`} src={"/person.png"}
                                alt={"P"}/></Tilt>
                        </div>
                    </div>
                ))}

                {/* The Blue Bio box */}
                {/* To change the x position of box change lg-left-[...] */}
                {/* Remember to change the title(Crdt_Title) position as well*/}
                <div className={`float-right grid grid-cols-1 size-[32vmax] lg:left-[55vw] top-[30vh] lg:top-[4vh] absolute
                    bg-[#021526] text-white rounded-2xl [box-shadow:0_2px_5px_rgba(0,0,0,0.2)] h-full w-[80%]
                    before:content-[''] before:absolute before:-bottom-4 before:left-0 before:w-[95%] before:ml-4
                    before:h-12 before:z-[-1] before:blur-xl before:bg-[linear-gradient(to_right,red,blue)]
                    before:bg-[length:200%_200%] before:animate-[aniGradBg_6.9s_ease_infinite]
                    ${(pause) ? 'before:[animation-play-state:paused]' : 'before:animation-play-state:running'}`}>
                    {ppl.map((cur, i) => (
                        <div className={`${(i === pos - 1) ? "animate-[fadIn_0.4s_ease-in_forwards]" : "hidden"} 
                            absolute p-8`} key={i}>
                            <p className={"text-2xl lg:text-4xl text-[#6EACDA] mb-4"}>
                                {cur.nme.split("").map((ltr, i) => (
                                    <span className={`animate-[bem_0.4s_ease-in_forwards] mb-2`}
                                          style={{animationDelay: `${i * 0.08}s`}}>{ltr}</span>
                                ))}
                            </p>
                            <p className="bg-[#03346E] px-3 pt-1 rounded-full text-lg w-fit mb-2">{cur.rol}</p>
                            <p className="text-sm">{cur.dsc}</p>
                            <div className="grid gap-2 mt-4">Socials:
                                {cur.soc.map((scl, i) => (
                                    <a href={scl.lnk} target="__blank" className="hover:text-white truncate" key={i}>
                                        <img className={"size-6 inline mr-1"} src={`${scl.ico}`}
                                             alt={scl.lnk}/>{scl.lnk}</a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center w-screen bg-blue-500/50 mt-80 lg:mt-24 py-2 left-0
                text-center text-[1.25rem] font-thin text-slate-300">
                {ppl.map((per, i) => (
                    <p onClick={() => setPos(i + 1)} className="hover:scale-125
                        transition-transform">
                        {per.nme.split(" ")[0]}</p>
                ))}
            </div>
        </div>
        // </div>
    );
};

export default Team;