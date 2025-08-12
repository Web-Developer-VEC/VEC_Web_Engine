// import {useState, useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router-dom';
import {ChevronDownIcon} from '@heroicons/react/24/solid'
import Sidebar from './SideBar'
import Nord from '../Assets/1723802229690.png'
import Naac from '../Assets/1723802229711.png'
import Acrd from '../Assets/1723802229732.png'
import iquage from '../Assets/iquage.png'
import Tnea from '../Assets/TNEA-Code.png'
import Inta from '../Assets/instagram.png'
import Fcbk from '../Assets/facebook.png'
import Twtr from '../Assets/twitter.png'
import Lknd from '../Assets/linkedin.png'
import logo from '../Assets/NEWLOGO.png'

const Head = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    // const [scroll, setScroll] = useState(0)
    // const [hdr, setHdr] = useState("")

    const nacs = [Naac, Acrd, Nord, iquage, Tnea]
    const hdrs = [
        { ttl: "Library", lnk: "/library" },
        { ttl: "IQAC", lnk: "/iqac" },
        { ttl:"Accreditations & Ranking",lnk:"/Accredation"},
        { ttl: "IIC", lnk: "/iic" },
        { ttl: "Incubation Cell", lnk: "/incubation" },
        { ttl: "Alumni", lnk: "/alumni" },
        { ttl: "NSS", lnk: "/NSS" },
        { ttl: "NCC", lnk: "/NCC" },
        { ttl: "YRC", lnk: "/YRC" },
        { ttl: "Sports", lnk: "/sports" },
        { ttl: "Transport", lnk: "/transport" },
        { ttl: "Hostel", lnk: "/hosLanding" },
        { ttl: "Other Facilities", lnk: "/other-facilities" },
        { ttl: "Help Desk", lnk: "/grievances" },
        { ttl:  "Gallery",lnk:"/gallery"},
        {
            ttl: "Login",
            lnk: "#",
            sub: [
                { ttl: "Student Login", lnk: "https://vecchennai.org/studentlogin/login.php?done=/studentlogin/" },
                { ttl: "Faculty Login", lnk: "https://vecchennai.org/stafflogin/login.php?done=/stafflogin/" },
            ],
        },
    ];

    const socls = [
        {
            Name: "Instagram",
            Link: "https://www.instagram.com/vec_chennai/",
            Ico: Inta,
            Fltr: "invert-[133%] sepia-[50%] saturate-[1732%] hue-rotate-[302deg] brightness-[94%] contrast-[85%]"
        },
        {Name: "Facebook", Link: "https://www.facebook.com/velammalengineeringcollege", Ico: Fcbk, Fltr: ""},
        {Name: "Twitter", Link: "https://x.com/VelammalEnggC", Ico: Twtr, Fltr: ""},
        {Name: "LinkedIn", Link: "https://www.linkedin.com/school/velammal-engineering-college/", Ico: Lknd, Fltr: ""},
    ]
    const navs = [
        {
            main: "About Us",
            cod: [0, 5],
            cols: 1,
            sub: [
                {hrd: false, ttl: "About VEC", sup: [], lnk: "/abt-us"},
                {hrd: false, ttl: "About Trust (VET)", sup: [], lnk: "/trust"},
                {hrd: false, ttl: "Vision & Mission", sup: [], lnk: "v_m"},
                {hrd: false, ttl: "Management", sup: [], lnk: "/management"},
                {hrd: false, ttl: "Contact Us", sup: [], lnk: "#footer"}, // Link to footer
            ],
        },
        {
            main: "Administration",
            cod: [0, 7],
            cols: 1,
            sub: [
                {hrd: false, ttl: "Principal", sup: [], lnk: "/principal"},
                {hrd: false, ttl: "Dean's & Asso Dean's", sup: [], lnk: "/dean"},
                {hrd: false, ttl: "Admin Office", sup: [], lnk: "/admin"},
                {hrd: false, ttl: "Administrative Committee", sup: [], lnk: "/committee"},
                {hrd: false, ttl:"Handbook",sup:[],lnk:"/handbook"},
                {hrd: false, ttl:"HR Handbook",sup:[],lnk:UrlParser("/static/pdfs/handbook/HR-Handbook.pdf") , openInNewTab: true},
                {hrd: false, ttl: "Organization Chart", sup: [], lnk: "/clg-org"},
            ], 
        },
        {
            main: "Academics",
            cod: [0, 3],
            cols: 1,
            sub: [
                { hrd: false, ttl: "Programmes", sup: [], lnk: "/programs" },
                { hrd: false, ttl: "Departments", sup: [], lnk: "/departments" },
                { hrd: false, ttl: "Academic Calendar", sup: [], lnk: "acadamic_cal" },
              ],
        },
        {
            main: "Admission",
            cod: [0, 5],
            cols: 1,
            sub: [
                {hrd: false, ttl: "B.E/B.Tech Admission", sup: [], lnk: "/ug"},
                {hrd: false, ttl: "M.E Admission", sup: [], lnk: "/m_e"},
                {hrd: false, ttl: "MBA Admission", sup: [], lnk: "/mba"},
                {hrd: false, ttl: "Ph.D Admission", sup: [], lnk: "/phd"},
                {hrd:false,ttl: "Admission Team",sup:[],lnk:"/admission-team"}
            ],
        },
        {
            main: "Exams",
            cod: [0, 5],
            cols: 1,
            sub: [
                {hrd: false, ttl: "Regulation", sup: [], lnk: "/reg"},
                {
                    hrd: false,
                    ttl: "Curriculum & Syllabus",
                    sup: [],
                    lnk: "/Syllabus",
                },
                {
                    hrd: false,
                    ttl: "Student Verification",
                    sup: [],
                    lnk: "https://vecchennai.directverify.in/student/#/app/request",
                    openInNewTab: true,
                },
                {hrd: false, ttl: "Downloads", sup: [], lnk: "/form"},
                {hrd: false, ttl: "Exam Team", sup: [], lnk: "/coe"},
            ],
        },
        {
            main: "Research",
            cod: [0, 4],
            cols: 1,
            sub: [

                {hrd: false, ttl: "Journal publication ", sup: [], lnk: "/Journal"}, //Sponseredresearch
                {hrd: false, ttl: "Books & Book Chapters", sup: [], lnk: "/Book_Chapter"} ,//Sponseredresearch
                {hrd: false, ttl: "Funded Projects", sup: [], lnk: "/Funded"}, //Sponseredresearch
                {hrd: false, ttl: "Consultancy", sup: [], lnk: "/Consultancy"},  //Academic
            ]
        },
        {
            main: "Placement",
            cod: [0, 4],
            cols: 1,
            sub: [
                {
                    hrd: false,
                    ttl: "About Placement Department",
                    sup: [],
                    lnk: "/abtplace",
                },
                {hrd: false, ttl: "Placement Details", sup: [], lnk: "/place-dep"},
                {hrd: false, ttl: "Alumni", sup: [], lnk: "/alumni"},
                {hrd: false, ttl: "Placement Team", sup: [], lnk: "/place-team"},
            ],
        },
    ];

    function max(arr) {
        let max = -Infinity
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] > max) max = arr[i]
        }
        return max
    }

    function griddy(nvd, cld) {
        let arr = [], num = cld.at(-1)
        if (cld.length > 2) num = max(cld.slice(0, -1))
        for (let i = 0; i < num; i++) {
            for (let j = 0; j < cld.length - 1; j++) {
                if (nvd[i + cld[j]]) {
                    arr.push(nvd[i + cld[j]])
                } else {
                    arr.push({ttl: '', sup: [], lnk: ''})
                }
            }
        }
        return arr
    }

    return (
        <>
            <nav className='fixed z-[100] w-full'>
                <div
                    className={'flex items-center font-popp group bg-prim dark:bg-drkts text-text dark:text-drkt' +
                        'transition-all ease-in-out duration-300 w-full h-auto ' +
                        ' h-20'}>
                    <a href="/" className="flex flex-col items-center justify-center text-decoration-none select-none ml-4">
                        <div className="z-10">
                            <img
                            src={logo}
                            alt="VEC Logo"
                            className="w-[2.5rem] md:w-[3.5rem] h-auto object-contain transition-all duration-300 ease-in-out"
                            />
                        </div>

                        <div className="text-center leading-tight mt-1 md:mt-1.5">
                            <span className="font-rome text-[0.75rem] md:text-[1.2rem] text-[#4B1E1E] dark:text-drks font-thin block">
                            VELAMMAL
                            </span>
                            <span className="font-rome text-[0.45rem] md:text-[0.8rem] text-gray-800 dark:text-drkt block tracking-wide">
                            ENGINEERING COLLEGE
                            </span>
                            <span className="font-rome text-[0.35rem] md:text-[0.65rem] text-gray-500 dark:text-drks italic block">
                            The Wheel of Knowledge rolls on!
                            </span>
                            <span className="font-rome text-[0.35rem] md:text-[0.65rem] text-gray-500 dark:text-drks italic block">
                            (An Autonomous Institution)
                            </span>
                        </div>
                    </a>
                    <div className="items-stretch relative h-max my-auto pb-2 group-[.hide]:-mt-2
                         ml-2 flex xl:w-[25vw] lg:w-[50vw]">
                        {nacs.map((nac, i) => (
                            <div className="duration-200 self-center ease-linear ml-0 lg:ml-8 xl:ml-2" data-carousel-item="" key={i}>
                                <img src={nac} className="block mt-2 h-full w-[5vmax] lg:w-[400px] xl:w-[7vmax] p-1" alt="naac"
                                     key="naac"/>
                            </div>
                        ))}
                    </div>
                    <div className='xl:flex flex-nowrap hidden ml-[70px] right-0 justify-end grow text-[clamp(1rem,1.125rem+1vw,1.15rem)]
                    max-w-[63.5%]
                        w-fit h-max gap-x-4 gap-y-0 duration-300 ease-in-out transition'>
                        {navs.map((nvt, ind) => (
                            <div className='group/nav relative transition-all mt-3 rounded-xl grow min-w-0' key={ind}>
                                <p className={`align-middle group-[.hide]:top-1 self-center w-fit p-[0.75vmin]
                                        hover:bg-[position:100%_0%] text-transparent
                                        bg-gradient-to-l from-secd dark:from-drks from-50% via-text dark:via-drkt via-50% 
                                        to-text dark:to-drkt to-90% bg-clip-text bg-[position:0%_0%] bg-[length:200%_100%]
                                        hover:ease-out hover:duration-700 ease-in-out duration-300 truncate `}>{nvt.main}
                                    <ChevronDownIcon
                                        className='size-[1.3vmax] mb-1 ml-1 inline text-text dark:text-drkt'></ChevronDownIcon>
                                </p>
                                <div className={`grid grid-flow-row content-center rounded-lg outline outline-offset-2
                                    group-hover/nav:outline-secd dark:group-hover/nav:outline-drks outline-transparent
                                    ${nvt.cols > 1 ? 'min-w-[55vw]' : 'w-max'}
                                    right-0 top-10 z-[500] absolute
                                    group-hover/nav:[clip-path:polygon(-2%_-2%,102%_-2%,102%_102%,-2%_102%)]
                                    [clip-path:polygon(0_0,100%_0,100%_0,0_0)]
                                    duration-500 ease-in transition-[th]
                                    bg-prim dark:bg-drkts`}
                                    style={{gridTemplateColumns: `repeat(${nvt.cols}, minmax(0, 1fr))`}}>
                                    {griddy(nvt.sub, nvt.cod).map((sbj, i, {length}) => (
                                        <div className='group/sub relative w-full bg-prim dark:bg-drkts first:rounded-lg last:rounded-b-lg' key={i}>
                                            <a className={`no-underline inline-block ${(i === 0) ? 'rounded-t-lg' : ''} bg-[length:200%_100%] bg-[position:0%_100%] text-slate-950 -translate-x-[50vw] px-2
                                                    ${(i === length - 1) ? 'rounded-b-lg' : ''} bg-gradient-to-l from-secd dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% border-slate-700
                                                    w-full group-hover/nav:translate-x-0 duration-[150ms] ease-in transition-all z-[500]` +
                                                (sbj.hrd || sbj.ttl === "" ? '' : ' hover:bg-[position:-100%_100%]')}
                                               style={{transitionDelay: `${((length > 10) ? 25 : 100) * i}ms`}}
                                               key={sbj.ttl} href={sbj.lnk}
                                               target={sbj.openInNewTab ? '_blank' : '_self'}
                                            ><p
                                                className={'w-full my-2 align-middle text-nowrap text-text dark:text-drkt dark:hover:text-drkts border-slate-500 border-dashed ' +
                                                    (sbj.hrd ? 'font-bold border-b-2 text-center' : 'text-left')}>{sbj.ttl}</p>
                                            </a>
                                            {(sbj.sup.length > 0) ? (
                                                <div className='absolute bg-prim dark:bg-drkts top-0 left-[105%] z-10 group-hover/sub:max-h-[70vh] max-h-0 h-fit overflow-y-hidden
                                                        outline group-hover/sub:outline-secd dark:group-hover/sub:outline-drks hover:max-h-[90vh] outline-transparent
                                                        outline-offset-2 duration-500 ease-in transiton-[ht] rounded-xl'>
                                                    {sbj.sup.map((spj, i, {length}) => (
                                                        <a className={`no-underline inline-block bg-[length:200%_100%] 
                                                            bg-[position:0%_100%] text-slate-950 -translate-x-[-40vw] px-2
                                                            ${(i !== length - 1) ? '' : ''} bg-gradient-to-l 
                                                            from-secd dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% 
                                                            w-full group-hover/sub:translate-x-0 hover:delay-0 duration-200 
                                                            ease-in transition-all hover:bg-[position:-100%_100%]`}
                                                           style={{transitionDelay: `${100 * i}ms`}}
                                                           key={sbj.ttl + i} href={spj.lnk}>
                                                            <p className='w-fit my-2 text-right align-middle
                                                            text-text dark:text-drkt text-nowrap'>{spj.ttl}</p>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (<p className='hidden'></p>)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='hidden xl:flex px-4 pt-1 pb-1.5 font-popp bg-secd dark:bg-drks text-text dark:text-drkts
                        gap-3 z-10 w-full max-h-[2.5rem] rounded-b-lg transition-all'>
                        {hdrs.map((hdr, index) => {
                            const isActive = location.pathname === hdr.lnk || (hdr.sub && hdr.sub.some(subItem => location.pathname === subItem.lnk));

                            return !hdr.sub ? (
                                // Single button (no submenu)
                                <button
                                    key={index}
                                    onClick={() => hdr.lnk.startsWith('http') ? window.location.href = hdr.lnk : navigate(hdr.lnk)}
                                    className={`mt-1 h-fit md:block hidden relative overflow-hidden pb-1 transition-all`}
                                >
                                    {hdr.ttl}
                                    {/* Underline animation */}
                                    <span className={`absolute bottom-0 left-0 h-[2px] bg-brwn transition-all duration-300 
                                                    ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}>
                                    </span>
                                </button>
                            ) : (
                                // Dropdown menu
                                <div key={index} className='group/nav relative transition-all rounded-xl'>
                                    <button className={`mt-1 h-fit md:block hidden relative overflow-hidden pb-1 transition-all`}>
                                        {hdr.ttl}
                                        {/* Animated underline */}
                                        <span className={`absolute bottom-0 left-0 h-[2px] bg-brwn transition-all duration-300 
                                                        ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}>
                                        </span>
                                    </button>
                                    <div className={`grid grid-flow-row content-center rounded-lg outline 
                                                    group-hover/nav:outline-secd dark:group-hover/nav:outline-drks outline-transparent 
                                                    right-0 top-10 z-[500] absolute group-hover/nav:max-h-[700vh] max-h-0 h-fit w-max outline-offset-2
                                                    group-hover/nav:[clip-path:inset(-100vw_-100vw_-100vw_-0.25vw)] [clip-path:inset(10vw_0vw_0vw_0vw)] 
                                                    duration-500 ease-in transiton-[ht] bg-prim dark:bg-drkts`}>
                                        {hdr.sub.map((subItem, i) => (
                                            <a
                                                key={i}
                                                href={subItem.lnk}
                                                className={`no-underline inline-block bg-[length:200%_100%] 
                                                            bg-[position:0%_100%] text-slate-950 -translate-x-[50vw] px-2
                                                            bg-gradient-to-l from-secd dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% 
                                                            w-full group-hover/nav:translate-x-0 duration-[150ms] ease-in transition-all z-[500] hover:bg-[position:-100%_100%]
                                                            ${location.pathname === subItem.lnk ? 'text-brwn font-semibold' : ''}`}
                                                target='_blank'
                                            >
                                                <p className='w-full my-2 align-middle text-nowrap text-text dark:text-drkt dark:hover:text-drkts'>{subItem.ttl}</p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Payment Button */}
                        <button 
                            onClick={() => window.open("https://easycollege.in/vecengg/college/webpayindex.aspx", "_blank")}
                            className="truncate mt-1 h-fit md:block hidden rounded-full bg-brwn text-white dark:text-drkts px-2">
                            Fees Payment
                        </button>

                        {/* Social Icons */}
                        <div className="flex group items-center justify-end grow gap-3">
                            {socls.map((socl, i) => (
                                <a href={socl.Link} key={i} target='_blank'>
                                    <img src={socl.Ico} alt={socl.Name}
                                        className="h-[1rem] group-[.showoff]:animate-[Social_2s_ease-in-out_forwards] 
                                                    mt-1 text-transparent"
                                        style={{ animationDelay: `${i * 1.9}s` }} />
                                </a>
                            ))}
                        </div>
                    </div>
                <div
                    className='block xl:hidden h-fit overflow-y-hidden'>
                    <Sidebar navs={navs} Sz="tny p-0"/></div>
            </nav>
        </>
    )
}


export default Head;