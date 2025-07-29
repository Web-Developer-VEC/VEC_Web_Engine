import React, {useState, useEffect, useCallback, useRef} from "react";
import Tilt from "react-parallax-tilt";
import {useNavigate} from "react-router-dom";
import { Github, Linkedin, Instagram, Mail, Globe, BadgeCheck } from "lucide-react";
import { FaRegSmileBeam } from 'react-icons/fa';

const Team = ({ani, callSld, ind, urlPrm}) => {
const ppl = [
    {
        "name": "SAMUEL STEPHEN DEVA PAUL L",
        "description": "Led a 17-member team to build Velammal Engineering College's official website using the MERN stack. Designed key pages in React, coordinated with college officials for live content, and deployed the site on AWS. Managed GitHub workflows, handled real-world bugs, and drove the project from planning to launch — not just leading, but building side by side with the team.",
        "roles": ["Team Lead", "Frontend Lead Developer"],
        "image": "/static/images/web_team/developers/Sam 2.webp",
        "cover_image": "/static/images/web_team/developers/Sam 1.png",
        "socials": [
        { "type": "linkedin", "link": "https://www.linkedin.com/in/samsdp/" },
        { "type": "github", "link": "https://github.com/SAMSDP" },
        {
            "type": "instagram",
            "link": "https://www.instagram.com/stephensam_16?igsh=MTVxdDQyY2VhbnByMQ=="
        },
        { "type": "mail", "link": "mailto:samsdpaul150@gmail.com" },
        { "type": "portfolio", "link": "https://samsdp-portfolio.vercel.app/" }
        ]
    },
    {
        "name": "SIDDHARTH MAGESH ",
        "description": "Served as the initial head honcho of the backend for this website... basically lived in the land of APIs, databases, and caffeine. Designed the entire database architecture and system layout like a grown-up LEGO set. Built scalable endpoints, wrangled all kinds of raw data, and processed it through custom modules crafted to tame the chaos.\n Handled server-side logic like a backend wizard... optimizing performance, integrating chatbot features (yes, it talks!), and ensuring everything stayed secure and reliable. If something broke at 3AM, chances are it was already being fixed... or lovingly yelled at through the console.",
        "roles": ["Backend Lead Developer", "System Architect"],
        "image": "/static/images/web_team/developers/Sid 2.webp",
        "cover_image": "/static/images/web_team/developers/Sid 1.png",
        "socials": [
        { "type": "linkedin", "link": "https://www.linkedin.com/in/siddharth-magesh-76688a246/" },
        { "type": "github", "link": "https://github.com/Siddharth-magesh" },
        { "type": "instagram", "link": "https://www.instagram.com/siddharth_magesh?igsh=dzZuNGJwdXB3M3hj " },
        { "type": "mail", "link": "mailto:siddharthmagesh007@gmail.com" },
        { "type": "portfolio", "link": "https://github.com/Siddharth-magesh/Siddharth-magesh" },
        {
            "type": "Hugging Face",
            "link": "https://huggingface.co/siddharth-magesh"
        },
        { "type": "Devfolio", "link": "https://devfolio.co/@SiddharthMagesh" }
        ]
    },
    {
        "name": "PRANESH KUMAR V",
        "description": "Backend wizard by day, bug hunter by night. I wrangle APIs with Node.js, stuff MongoDB with JSONs using Python like it's a sacred ritual, and deploy my creations to the cloud with AWS (because local is too mainstream). I push, pull, and occasionally rage at Git while powering the brains behind our college website. I speak fluent JSON, enjoy long walks through error logs, and believe coffee is just a backend dependency.",
        "roles": ["Backend Developer", "API Developer"],
        "image": "/static/images/web_team/developers/Pranesh 2.webp",
        "cover_image": "/static/images/web_team/developers/pranesh 1.png",
        "socials": [
        {
            "type": "linkedin",
            "link": "https://www.linkedin.com/in/pranesh-pk-362760250/"
        },
        { "type": "github", "link": "https://github.com/PraneshPk2005" },
        { "type": "mail", "link": "mailto:praneshvaradharaj@gmail.com" },
        { "type": "portfolio", "link": "https://praneshpk-portfolio.vercel.app/" }
        ]
    },
    {
        "name": "Leroy Jeslyn",
        "description": "I was a Frontend Developer for the VEC website, where i built sleek, responsive pages using Tailwind and React. I was also behind some of the cool animated CSS stuff: that boot-up page animations, the smooth slide-in gradients, and interactive 3D Department Carousel. And I totally hooked up the dark mode toggle for the VEC website. You're welcome.",
        "roles": ["Frontend Developer","UI Designer"],
        "image": "/static/images/web_team/developers/Leroy 2.webp",
        "cover_image": "/static/images/web_team/developers/Leroy 1.png",
        "socials": [
        {
            "type": "linkedin",
            "link": " https://www.linkedin.com/in/leroy-jeslyn-a653a2246/"
        },
        { "type": "github", "link": "https://github.com/Shadow-Knight503" },
         { "type": "instagram", "link": " https://www.instagram.com/_shadow_knight_503?igsh=NjhiZTY4aDF3eGh0" },
        { "type": "mail", "link": "mailto:leroyjeslyn@gmail.com" },
        ]
    },
    {
        "name": "SRI HARI M",
        "description": "Worked as a Frontend Developer on the college website, where I built and maintained multiple responsive pages using React.js and Bootstrap. Translated UI designs into functional, consistent layouts and ensured compatibility across different devices and screen sizes. Collaborated with the backend team to integrate data and features effectively.",
        "roles": ["Frontend Developer", "UI Designer"],
        "image": "/static/images/web_team/developers/Srihari 2.webp",
        "cover_image": "/static/images/web_team/developers/Srihari 1.png",
        "socials": [
        { "type": "linkedin", "link": "https://www.linkedin.com/in/sri-hari22/" },
        { "type": "github", "link": "https://github.com/SriHari22004" },
        { "type": "instagram", "link": "https://instagram.com/srihari22__" },
        { "type": "mail", "link": "mailto:srihari22004@gmail.com" }
        ]
    },
    {
        "name": "RAGESHWARAN HR",
        "description": "Showcased course details, departments, events, and contact info—designed clean, responsive landing pages using React.js and Tailwind CSS. Developed reusable UI components, ensured mobile responsiveness, and brought smooth user experience to life.",
        "roles": ["Frontend Developer"],
        "image": "/static/images/web_team/developers/Rageshwaran 2.webp",
        "cover_image": "/static/images/web_team/developers/Rageshwaran 1.png",
        "socials": [
        { "type": "linkedin", "link": " https://www.linkedin.com/in/rageshwaranhr" },
        { "type": "github", "link": "https://github.com/Rageshwaran-HR" },
        { "type": "instagram", "link": " https://www.instagram.com/varnorawork" },
        { "type": "mail", "link": "mailto:rageshwaranhr@gmail.com " }
        ]
    },
    {
        "name": "MOHAMED YASIR A",
        "description": "Started off by helping with the initial design phase of the college website, where I worked on wireframes and layout ideas to shape the overall look and feel. Later, I took on the role of a Frontend Developer, building and refining user-facing components to make the site clean, functional, and easy to navigate. I spent a good amount of time handling data collection, organizing files, and processing content to make sure everything stayed consistent and accessible for the team. It was a mix of creative thinking and hands-on work that taught me how important structure and detail are, especially when things scale. Looking back, I feel like I could’ve planned my file organization better early on—it would've saved a lot of time in the long run. But overall, it pushed me to understand both the visual and functional sides of web development more deeply.",
        "roles": ["Frontend Developer", "UI Planner"],
        "image": "/static/images/web_team/developers/Yasir 2.webp",
        "cover_image": "/static/images/web_team/developers/Yasir 1.png",
        "socials": [
        { "type": "linkedin", "link": "https://www.linkedin.com/in/mdyasir8055" },
        { "type": "github", "link": "https://github.com/mdyasir8055" },
        { "type": "instagram", "link": "https://www.instagram.com/mdyasir_8055" },
        { "type": "mail", "link": "mailto:mdyasir8055@gmail.com" },
        { "type": "portfolio", "link": "https://mdyasirportfolio.vercel.app/" }
        ]
    },
    {
        "name": "VASANTHA RAJA S",
        "description": "Built sleek, responsive pages with React.js—because static sites are so last season. Crafted pixel-perfect layouts, well-behaved buttons, and smooth user experiences using Tailwind, Bootstrap, and a dash of CSS magic.Teamed up with the backend squad to keep data flowing like butter on a hot dosa. Leveled up my frontend powers and got a real taste of web dev beyond the tutorial zone.",
        "roles": ["Frontend Developer","responsive UI Designer"],
        "image": "/static/images/web_team/developers/Vasanth 2.webp",
        "cover_image": "/static/images/web_team/developers/VasanthRaja 1.png",
        "socials": [
        { "type": "linkedin", "link": "linkedin.com/in/vasantharajas123" },
        { "type": "github", "link": "github.com/Vasanth-Aids" },
        {
            "type": "instagram",
            "link": "instagram.com/v_s_n_h_007?igsh=NXk5YzR0dGQ1b2h5"
        },
        { "type": "mail", "link": "mailto:selvamvasath2005@gmail.com" }
        ]
    },
    {
        "name": "GOKULRAMANAN V",
        "description": "Gokulramanan developed a RAG-based chatbot from end to end. He transformed raw JSON files into clean, structured text, generated vector embeddings, and integrated them with the LLaMA 3.3 model to enable context-aware responses. He also built backend components, including writing API endpoints and connecting the vector store with the language model, ensuring smooth and intelligent chatbot interactions.",
        "roles": ["Backend Developer","Chatbot Developer"],
        "image": "/static/images/web_team/developers/Gokul 2.webp",
        "cover_image": "/static/images/web_team/developers/Gokul 1.png",
        "socials": [
        {
            "type": "linkedin",
            "link": "https://www.linkedin.com/in/gokul-v-568641257"
        },
        { "type": "github", "link": "https://github.com/Feininon" },
        { "type": "instagram", "link": "https://www.instagram.com/gokuloo3" },
        { "type": "mail", "link": "mailto:gokulramananvec@gmail.com" }
        ]
    },
    {
        "name": "WAATSON J",
        "description": "Worked as a Backend Developer for a college website, where I handled everything from building smooth Node.js APIs to writing Python scripts that populated MongoDB with structured data. I kept the backend running efficiently and connected it with the frontend to ensure a seamless experience. It was a hands-on role that taught me a lot about managing data, debugging under pressure, and collaborating with others to bring features to life. Alongside that, I also contributed during the early stages of developing a RAG-based chatbot for the same site. I started by organizing scattered JSON data into meaningful, context-rich sentences and turned them into vector embeddings for efficient retrieval. Using the LLaMA 3.3 model, the chatbot was trained to answer user queries with accuracy, becoming a helpful guide across the college website.",
        "roles": ["Data Engineer","Backend Developer" ],
        "image": "/static/images/web_team/developers/Watson 2.webp",
        "cover_image": "/static/images/web_team/developers/Watson 1.png",
        "socials": [
        { "type": "linkedin", "link": "https://www.linkedin.com/in/waatson-j/" },
        { "type": "github", "link": "https://github.com/WAATS0N" },
        { "type": "mail", "link": "mailto:waatson.j@gmail.com " }
        ]
    },
    {
        "name": "SAI VIGNESH RAJ M",
        "description": "Embarked on a full-stack quest to build a RAG-based chatbot for a college website. Began by wrangling scattered JSON scrolls from across the digital realm, forging them into self-sufficient, context-rich sentences. Enchanted this knowledge into vector embeddings for swift retrieval. Armed with the LLaMA 3.3 model as the conversational engine, the system answered user queries with precision and insight. Navigated challenges of scarce resources and treacherous data pipelines to craft a resilient, lightweight AI companion — purpose-built for guiding users through the vast halls of the college web domain.",
        "roles": ["Full-Stack Chatbot Developer", "Data Engineer"],
        "image": "/static/images/web_team/developers/Sai 2.webp",
        "cover_image": "/static/images/web_team/developers/Sai 1.png",
        "socials": [
        {
            "type": "linkedin",
            "link": "http://linkedin.com/in/sai-vignesh-raj-ba5997253/"
        },
        { "type": "github", "link": "https://github.com/SaiVignesh45" },
        {
            "type": "instagram",
            "link": "https://www.instagram.com/m_sai_vignesh/profilecard/?igsh=ZjlyYXV1aG53aDJo"
        },
        { "type": "mail", "link": "mailto:saivignesh1204@gmail.com " }
        ]
    },
    {
        "name": "KUMAR P",
        "description": "Designed modern, mobile-friendly interfaces using React.js—because plain old static pages just don’t cut it anymore. Focused on fluid layouts, responsive elements, and polished user flows with the help of Tailwind CSS, Bootstrap, and a hint of handcrafted styling. Worked alongside the backend crew to keep everything synced up like a well-oiled engine. From connecting APIs to handling live data, I got hands-on experience with the real challenges of building dynamic web apps. This phase really boosted my frontend confidence and gave me a proper dive into the world of actual development—way past the YouTube tutorial comfort zone.",
        "roles": ["Frontend Developer",""],
        "image": "/static/images/web_team/developers/Kumar 2.webp",
        "cover_image": "/static/images/web_team/developers/Kumar 1.png",
        "socials": [
        { "type": "linkedin", "link": "https://linkedin.com/in/kumar-p-75" },
        { "type": "github", "link": "github.com/kumar7505" },
        {
            "type": "instagram",
            "link": "https://www.instagram.com/its.kumarhere?igsh=MWYxbDY5ZGMyenFicw=="
        },
        { "type": "mail", "link": "mailto:kumarpers7@gmail.com" }
        ]
    },
    {
        "name": "SRI RAAM V H",
        "description": "Built and maintained  multiple  React.js pages. From integrating APIs to crafting sleek, responsive UIs with CSS  React, bootstrap tailwind. turned design mockups into functional reality. Obsessed with clean code and smooth UX. Did manual testing and made sure the website is compatible  with different devices.the site worked like a charm on every screen size — even the weirdly tiny ones professors insist on using.",
        "roles": ["Frontend Developer", "QA Tester"],
        "image": "/static/images/web_team/developers/sriraam 2.webp",
        "cover_image": "/static/images/web_team/developers/Sriraam 1.png",
        "socials": [
        { "type": "linkedin", "link": "linkedin.com/in/sri-raam-v-h" },
        { "type": "github", "link": "https://github.com/Sriraam29" },
        {
            "type": "instagram",
            "link": "https://www.instagram.com/sriraam_0029?igsh=dHlpM2RyZzJhcmd3"
        },
        { "type": "mail", "link": "mailto:sriraamhari04@gmail.com " }
        ]
    },
    {
        "name": "ARJUN V L",
        "description": "Worked as a Backend Developer for a website, keeping the digital gears turning behind the scenes. Juggled data entry like a wizard and crafted slick Node.js APIs that just worked. Wrote Python scripts to stuff MongoDB with data like a pro. Tied the frontend and backend together like a tech matchmaker. An adventure full of learning, logic, laughs, and the occasional late-night bug battle!",
        "roles": [ "Data Entry","Backend Developer"],
        "image": "/static/images/web_team/developers/Arjun 2.webp",
        "cover_image": "/static/images/web_team/developers/Sam 1.png",
        "socials": [
        {
            "type": "linkedin",
            "link": "https://www.linkedin.com/in/arjun-vanameeganathan-lakshmi-63b820258/"
        },
        { "type": "github", "link": "https://github.com/vlarjun20" },
        {
            "type": "instagram",
            "link": "https://www.instagram.com/w.h.i.t.e_w.o.l.f_20?igsh=cTlnaDRlZGw4bGY3"
        },
        { "type": "mail", "link": "mailto:vlarjun2022@gmail.com " },
        { "type": "portfolio", "link": " https://arjunportfoli.vercel.app/" }
        ]
    },
    {
        "name": "SANTHOSH G",
        "description": "Worked as a Frontend Developer on the college website. Built responsive pages using React.js, Tailwind, CSS, and Bootstrap. Collaborated with the backend team to ensure seamless data integration. Focused on clean, maintainable code and consistent UI design. Ensured full responsiveness across all screen sizes and devices.",
        "roles": ["Frontend Developer"],
        "image": "/static/images/web_team/developers/Santhosh 2.webp",
        "cover_image": "/static/images/web_team/developers/Santhosh 1.png",
        "socials": [
        {
            "type": "linkedin",
            "link": "https://www.linkedin.com/in/santhosh-g-81aa75360/"
        },
        { "type": "github", "link": "https://github.com/Sandysharpo" },
        {
            "type": "instagram",
            "link": "https://www.instagram.com/sandy._.sharp?igsh=MWp0bnljd3JuN29meg== "
        },
        { "type": "mail", "link": "mailto:santhoshsandy9840l@gmail.com" }
        ]
    },
    {
        "name": "Hari Prasath",
        "description": "Jumped into this project as the go-to guy for all things cloud and backend. Spent most of my time testing cloud platforms, tweaking deployments, and wrestling with configurations until they behaved. Also pitched in as a backend intern—debugging logic, building APIs, and occasionally arguing with the server (spoiler: it rarely listened). Cloud chaos? That was my playground.",
        "roles": ["Cloud Engineer","Backend Developer" ],
        "image": "/static/images/web_team/developers/Hari 2.webp",
        "cover_image": "/static/images/web_team/developers/Hari 1.png",
        "socials": [
        {
            "type": "linkedin",
            "link": "https://www.linkedin.com/in/hariprasath4274?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app "
        },
        { "type": "github", "link": "https://github.com/4274-hari" },
        {
            "type": "instagram",
            "link": "https://www.instagram.com/_.irah._07?utm_source=qr&igsh=MXQ0dGFpdTk3OGo1Mw==  "
        },
        { "type": "mail", "link": "mailto:hari.velusmy@gmail.com" }
        ]
    },
    {
        "name": "Ajith",
        "description": "Took the reins on the frontend and made sure everything looked smooth, sharp, and ran across screens like butter. From crafting layouts to perfecting styles, I made pages not just work—but work everywhere. Also moonlighted as the integration engineer, connecting frontend to backend like a tech therapist. If it moved and looked good, I probably styled it.",
        "roles": ["Frontend Developer", "Integration Engineer"],
        "image": "/static/images/web_team/developers/Ajith 2.webpg",
        "cover_image": "/static/images/web_team/developers/Ajith 1.png",
        "socials": [
        {
            "type": "linkedin",
            "link": "https://www.linkedin.com/in/ajith-g-923b25274/"
        },
        { "type": "github", "link": "https://github.com/Ajith-ajay"
        },
        {
            "type": "portfolio",
            "link": "https://myprotfoliostu.web.app/"
        },
        { "type": "mail", "link": "mailto:ajithajay1029@gmail.com" }
        ]
    }
    ]
    const [pause, setPause] = useState(false);
    const [pos, setPos] = useState(1);
    const durToNxt = (ind !== urlPrm)? 10000000: 9000
    const navigate = useNavigate();


    const iconMap = {
    github: <Github className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    mail: <Mail className="w-5 h-5" />,
    portfolio: <Globe className="w-5 h-5" />,
    "Hugging Face": <FaRegSmileBeam className="w-5 h-5" />,
    Devfolio: <BadgeCheck className="w-5 h-5"/>
    };

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
        <div className="h-full">
            {(ind !== urlPrm) ?
                <h3 className={"w-screen bg-blue-500/50 py-2 left-0 text-center text-[1.25rem] font-thin text-slate-300"}>
                    You are viewing <b className="font-bold">{ppl[+(ind) - 1].name}</b>'s customised view
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
                                <img className={(pos === i + 1) ? 'hidden' : 'blur-sm h-full rounded-2xl'} src={cur.image}
                                     alt={cur.name}/>
                            </div>
                            <Tilt><img
                                className={`${(pos === i + 1) ? 'animate-[sizeUpExt_0.3s_ease-in-out_forwards] ' :
                                    'hidden'} absolute h-[26vmax] -top-8 lg:top-10 origin-bottom`} src={cur.cover_image}
                                alt={cur.name}/></Tilt>
                        </div>
                    </div>
                ))}

                {/* The Blue Bio box - Now with dynamic height */}
                <div className={`float-right grid grid-cols-1 min-h-[32vmax] w-[50vmax] lg:left-[55vw] top-[30vh] lg:top-[4vh] relative
                    bg-[#021526] text-white rounded-2xl [box-shadow:0_2px_5px_rgba(0,0,0,0.2)] max-w-[80%]
                    before:content-[''] before:absolute before:-bottom-4 before:left-0 before:w-[95%] before:ml-4
                    before:h-12 before:z-[-1] before:blur-xl before:bg-[linear-gradient(to_right,red,blue)]
                    before:bg-[length:200%_200%] before:animate-[aniGradBg_6.9s_ease_infinite]
                    ${(pause) ? 'before:[animation-play-state:paused]' : 'before:animation-play-state:running'}`}>
                    {ppl.map((cur, i) => (
                        <div className={`${(i === pos - 1) ? "animate-[fadIn_0.4s_ease-in_forwards]" : "hidden"} 
                            p-6 lg:p-8 h-fit w-full overflow-hidden`} key={i}>
                            <p className={"text-xl lg:text-3xl xl:text-4xl text-[#6EACDA] mb-4 leading-tight break-words"}>
                                {cur.name.split("").map((ltr, i) => (
                                    <span key={i} className={`animate-[bem_0.4s_ease-in_forwards] mb-2`}
                                          style={{animationDelay: `${i * 0.08}s`}}>{ltr}</span>
                                ))}
                            </p>
                            <div className="flex gap-2">
                                {cur.roles.map((rol,i) => (
                                    <p className="bg-[#03346E] px-3 pt-1 rounded-full text-sm lg:text-base w-fit mb-3">{rol}</p>
                                ))}
                            </div>
                            <p className="text-xs lg:text-sm leading-relaxed mb-4 text-gray-200 whitespace-pre-line text-justify">{cur.description}</p>
                            <div className="mt-4">
                                <p>Social Links</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3 justify-center items-center">
                                    {cur.socials
                                    .map((s, i) => (
                                        <a
                                        key={i}
                                        href={s.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 lg:gap-2 p-1.5 lg:p-2 rounded text-xs lg:text-sm hover:bg-gray-700 hover:text-white truncate transition-colors w-fit"
                                        >
                                        {iconMap[s.type]}
                                        <span className="truncate capitalize">{s.type}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center w-screen bg-blue-500/50 mt-80 lg:mt-24 py-2 left-0
                text-center text-[1.25rem] font-thin text-slate-300">
                {ppl.map((per, i) => (
                    <p key={i} onClick={() => setPos(i + 1)} className="hover:scale-125
                        transition-transform cursor-pointer">
                        {per.name.split(" ")[0]}</p>
                ))}
            </div>
        </div>
    );
};

export default Team;