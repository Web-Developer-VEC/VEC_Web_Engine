// import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom';
import {ChevronDownIcon} from '@heroicons/react/24/solid'
import Sidebar from './SideBar'
import Nord from '../Assets/1723802229690.png'
import Naac from '../Assets/1723802229711.png'
import Acrd from '../Assets/1723802229732.png'
import Tnea from '../Assets/TNEA-Code.png'
import Inta from '../Assets/instagram.png'
import Fcbk from '../Assets/facebook.png'
import Twtr from '../Assets/twitter.png'
import Lknd from '../Assets/linkedin.png'

const Head = () => {
    const navigate = useNavigate();

    // const [scroll, setScroll] = useState(0)
    // const [hdr, setHdr] = useState("")

    const nacs = [Naac, Acrd, Nord, Tnea]
    const hdrs = ["velammal@velammal.edu.in", "+91 99566 00420", "NBA", "NAAC", "NIRF", "IIC",
        "Incubation Cell", "Alumni", "NSS", "NCC", "YRC", "Sports", "Transport", "Library", "Hostel",
        "Other Facilities", "Grievances", "Login", "Fee Payments"]
    const socls = [
        {
            Name: "Instagram",
            Link: "https://instagram.com",
            Ico: Inta,
            Fltr: "invert-[133%] sepia-[50%] saturate-[1732%] hue-rotate-[302deg] brightness-[94%] contrast-[85%]"
        },
        {Name: "Facebook", Link: "https://instagram.com", Ico: Fcbk, Fltr: ""},
        {Name: "Twitter", Link: "https://instagram.com", Ico: Twtr, Fltr: ""},
        {Name: "LinkedIn", Link: "https://instagram.com", Ico: Lknd, Fltr: ""},
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
            cod: [0, 5],
            cols: 1,
            sub: [
                {hrd: false, ttl: "Principal", sup: [], lnk: "/principal"},
                {hrd: false, ttl: "Dean's & Asso Dean's", sup: [], lnk: "/dean"},
                {hrd: false, ttl: "Admin Office", sup: [], lnk: "/admin"},
                {hrd: false, ttl: "Committee's", sup: [], lnk: "/committee"},
                {hrd: false, ttl: "Organization Chart", sup: [], lnk: "/clg-org"},
            ],
        },
        {
            main: "Academics",
            cod: [0, 11, 13],
            cols: 2,
            sub: [
                {hrd: true, ttl: "UG Courses", sup: [], lnk: ""},
                {
                    hrd: false,
                    ttl: "Artificial Intelligence and Data Science",
                    sup: [],
                    lnk: "/dept/001",
                    deptID: "001",
                },
                {
                    hrd: false,
                    ttl: "Automobile Engineering",
                    sup: [],
                    lnk: "/dept/002",
                    deptID: "002",
                },
                {
                    hrd: false,
                    ttl: "Civil Engineering",
                    sup: [],
                    lnk: "/dept/004",
                    deptID: "004",
                },
                {
                    hrd: false,
                    ttl: "Computer Science and Engineering",
                    sup: [],
                    lnk: "/dept/005",
                    deptID: "005",
                },
                {
                    hrd: false,
                    ttl: "Computer Science and Engineering (Cyber Security)",
                    sup: [],
                    lnk: "/dept/006",
                    deptID: "006",
                },
                {
                    hrd: false,
                    ttl: "Electrical and Electronics Engineering",
                    sup: [],
                    lnk: "/dept/007",
                    deptID: "007",
                },
                {
                    hrd: false,
                    ttl: "Electronics and Communication Engineering",
                    sup: [],
                    lnk: "/dept/009",
                    deptID: "009",
                },
                {
                    hrd: false,
                    ttl: "Electronics and Instrumentation Engineering",
                    sup: [],
                    lnk: "/dept/008",
                    deptID: "008",
                },
                {
                    hrd: false,
                    ttl: "Information Technology",
                    sup: [],
                    lnk: "/dept/011",
                    deptID: "011",
                },
                {
                    hrd: false,
                    ttl: "Mechanical Engineering",
                    sup: [],
                    lnk: "/dept/013",
                    deptID: "013",
                },
                {hrd: true, ttl: "PG Courses", sup: [], lnk: ""},
                {
                    hrd: false,
                    ttl: "M.E. Computer Science & Engineering",
                    sup: [],
                    lnk: "/dept/002",
                    deptID: "001",
                }, //
                {
                    hrd: false,
                    ttl: "M.E. Power System Engineering",
                    sup: [],
                    lnk: "/dept/002",
                    deptID: "001",
                }, //
                {
                    hrd: false,
                    ttl: "Master of Business Administration",
                    sup: [],
                    lnk: "/dept/002",
                    deptID: "001",
                }, //
                // {hrd: false, ttl: "", sup: [], lnk: ""},
                {hrd: true, ttl: "Science & Humanities", sup: [], lnk: ""},
                {
                    hrd: false,
                    ttl: "Chemistry",
                    sup: [],
                    lnk: "/dept/003",
                    deptID: "003",
                },
                {
                    hrd: false,
                    ttl: "English",
                    sup: [],
                    lnk: "/dept/010",
                    deptID: "010",
                },
                {
                    hrd: false,
                    ttl: "Mathematicis",
                    sup: [],
                    lnk: "/dept/012",
                    deptID: "012",
                },
                {
                    hrd: false,
                    ttl: "Physics",
                    sup: [],
                    lnk: "/dept/015",
                    deptID: "015",
                },
                {
                    hrd: false,
                    ttl: "Tamil",
                    sup: [],
                    lnk: "/dept/002",
                    deptID: "001",
                }, //
            ],
        },
        {
            main: "Admission",
            cod: [0, 4],
            cols: 1,
            sub: [
                {hrd: false, ttl: "B.E/B.Tech Admission", sup: [], lnk: "/ug"},
                {hrd: false, ttl: "M.E Admission", sup: [], lnk: "/m_e"},
                {hrd: false, ttl: "MBA Admission", sup: [], lnk: "/mba"},
                {hrd: false, ttl: "Ph.D Programme Details", sup: [], lnk: "/phd"},
            ],
        },
        {
            main: "Exams",
            cod: [0, 4],
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
                {hrd: false, ttl: "All Forms", sup: [], lnk: "/form"},
            ],
        },
        {
            main: "Research",
            cod: [0, 5],
            cols: 1,
            sub: [
                {hrd: false, ttl: "Academic Research", sup: [], lnk: "/Academic"},
                {hrd: false, ttl: "Sponsored Research", sup: [], lnk: "/Sponseredresearch"},
                {
                    hrd: false,
                    ttl: "Publication",
                    sup: [
                        {hrd: false, ttl: "Journal", sup: [], lnk: "/journal"},
                        {hrd: false, ttl: "Conference", sup: [], lnk: "/conference"},
                    ],
                    lnk: "",
                },
                {hrd: false, ttl: "Patents", sup: [], lnk: "/patents"},
                {
                    hrd: false,
                    ttl: "Book Publications",
                    sup: [],
                    lnk: "/Bookpubliction",
                },
            ],
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
                {hrd: false, ttl: "Placement Team", sup: [], lnk: "/place-team"},
                {hrd: false, ttl: "Placement Details", sup: [], lnk: "/place-dep"},
                {hrd: false, ttl: "Our Proud Alumni", sup: [], lnk: "/proudalumni"},
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

    // const hndlScrll = () => {
    //     const pos = window.scrollY
    //     const pos_thresh = 0
    //     if (pos > pos_thresh) {
    //         setHdr("showoff")
    //     } else {
    //         setHdr("")
    //     }
    //     setScroll(pos)
    // }

    // useEffeaccn{
    //     window.addEventListener('scroll', hndlScrll, {passive: truatext dark:text-drkt//     return () => {
    //         window.removeEventListener(text dark:text-drktll', hndlScrll)
    //     }
    // })
    return (
        <>
            <nav className='fixed z-[100] w-full'>
                <div
                    className={'flex items-center font-popp group bg-prim dark:bg-drkp text-text dark:text-drkt ' +
                        'transition-all ease-in-out duration-300 w-full h-auto ' +
                        ' h-20'}>
                    <a href="/" className="flex items-center text-decoration-none">
                        <div className='bg-inherit z-10'>
                            <img
                                src='https://res.cloudinary.com/meme-topia/image/upload/v1723784096/image-removebg-preview_ciglfw.png'
                                alt='Vec Logo'
                                className='group-[.hide]:w-[2.5rem] group-[.hide]:h-[2.5rem] z-10 duration-300 ease-in-out transition-all w-[6.5vmax] h-auto'></img>
                        </div>
                        <div
                            className='w-fit h-auto grid grid-cols-1 gap-y-0 content-center relative group-[.hide]:-mt-1.5 duration-300 ease-out transition-all'>
                            <span className='font-rome text-[2vmax] text-accn p-0 -mb-[0.75vmax]'>VELAMMAL</span>
                            <span
                                className='font-rome text-text dark:text-drkt text-[1vmax] mt-0 p-0 transition-all ease-in-out duration-300'>ENGINEERING COLLEGE</span>
                            <span
                                className="font-rome text-text dark:text-drkt text-[0.7vmax] mt-0 p-0 text-center transition-all ease-in-out duration-300">The Wheel of Knowledge rolls on!</span>
                        </div>
                    </a>
                    <div className="items-stretch relative h-max my-auto pb-2 group-[.hide]:-mt-2
                        lg:max-w-[17.5vw] max-w-[40%] ml-2 flex">
                        {nacs.map((nac, i) => (
                            <div className="duration-200 self-center ease-linear" data-carousel-item="" key={i}>
                                <img src={nac} className="block max-h-[5vmax] mt-2 h-full w-auto p-1" alt="naac"
                                     key="naac"/>
                            </div>
                        ))}
                    </div>
                    <div className='lg:flex flex-wrap hidden right-0 justify-end grow text-[1.2vmax] max-w-[63.5%]
                        w-fit h-max gap-x-4 gap-y-0 duration-300 ease-in-out transition'>
                        {navs.map((nvt, ind) => (
                            <div className='group/nav relative transition-all mt-3 rounded-xl' key={ind}>
                                <p className={`align-middle group-[.hide]:top-1 self-center w-fit p-[0.75vmin]
                                        hover:bg-[position:100%_0%] text-transparent
                                        bg-gradient-to-l from-secd dark:from-drks from-50% via-text dark:via-drkt via-50% 
                                        to-text dark:to-drkt to-90% bg-clip-text bg-[position:0%_0%] bg-[length:200%_100%]
                                        hover:ease-out hover:duration-700 ease-in-out duration-300`}>{nvt.main}
                                    <ChevronDownIcon
                                        className='size-[1.3vmax] mb-1 ml-1 inline text-text dark:text-drkt'></ChevronDownIcon>
                                </p>
                                <div className={`grid grid-flow-row content-center rounded-lg outline 
                                    group-hover/nav:outline-secd dark:group-hover/nav:outline-drks outline-transparent 
                                        right-0 top-10 z-[500] absolute group-hover/nav:max-h-[700vh] max-h-0 h-fit ${nvt.cols > 1 ? 'min-w-[55vw]' : 'w-max'} outline-offset-2
                                        group-hover/nav:[clip-path:inset(-100vw_-100vw_-100vw_-0.25vw)] [clip-path:inset(10vw_0vw_0vw_0vw)] 
                                        duration-500 ease-in transiton-[ht] bg-prim dark:bg-drkp`}
                                     style={{gridTemplateColumns: `repeat(${nvt.cols}, minmax(0, 1fr))`}}>
                                    {griddy(nvt.sub, nvt.cod).map((sbj, i, {length}) => (
                                        <div className='group/sub relative w-full bg-prim dark:bg-drkp first:rounded-lg last:rounded-b-lg' key={i}>
                                            <a className={`no-underline inline-block ${(i === 0) ? 'rounded-t-lg' : ''} bg-[length:200%_100%] bg-[position:0%_100%] text-slate-950 -translate-x-[50vw] px-2
                                                    ${(i === length - 1) ? 'rounded-b-lg' : ''} bg-gradient-to-l from-secd dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% border-slate-700
                                                    w-full group-hover/nav:translate-x-0 duration-[150ms] ease-in transition-all z-[500]` +
                                                (sbj.hrd || sbj.ttl === "" ? '' : ' hover:bg-[position:-100%_100%]')}
                                               style={{transitionDelay: `${((length > 10) ? 25 : 100) * i}ms`}}
                                               key={sbj.ttl} href={sbj.lnk}
                                               target={sbj.openInNewTab ? '_blank' : '_self'}
                                            ><p
                                                className={'w-full my-2 align-middle text-nowrap text-text dark:text-drkt border-slate-500 border-dashed ' +
                                                    (sbj.hrd ? 'font-bold border-b-2 text-center' : 'text-left')}>{sbj.ttl}</p>
                                            </a>
                                            {(sbj.sup.length > 0) ? (
                                                <div className='absolute bg-prim dark:bg-drkp top-0 left-[105%] z-10 group-hover/sub:max-h-[70vh] max-h-0 h-fit overflow-y-hidden
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
                        {/* </div> */}
                    </div>
                </div>
                <div className='hidden lg:flex px-4 pb-1.5 font-popp bg-secd dark:bg-drks text-text dark:text-drkt
                gap-3 z-10 w-full max-h-[2.5rem] rounded-b-lg transition-all'>

                    <button onClick={() => navigate('/nba')} className='mt-1 h-fit md:block hidden'>{hdrs[2]}</button>
                    <button onClick={() => navigate('/naac')} className='mt-1 h-fit md:block hidden'>{hdrs[3]}</button>
                    <button onClick={() => navigate('/nirf')} className='mt-1 h-fit md:block hidden'>{hdrs[4]}</button>
                    <button onClick={() => navigate('/iic')} className='mt-1 h-fit md:block hidden'>{hdrs[5]}</button>
                    <button onClick={() => navigate('/incubation')} className='mt-1 h-fit md:block hidden'>{hdrs[6]}</button>
                    <button onClick={() => navigate('/alumni')} className='mt-1 h-fit md:block hidden'>{hdrs[7]}</button>
                    <button onClick={() => navigate('/NSS')} className='mt-1 h-fit md:block hidden'>{hdrs[8]}</button>
                    <button onClick={() => navigate('/NCC')} className='mt-1 h-fit md:block hidden'>{hdrs[9]}</button>
                    <button onClick={() => navigate('/YRC')} className='mt-1 h-fit md:block hidden'>{hdrs[10]}</button>
                    <button onClick={() => navigate('/sports')} className='mt-1 h-fit md:block hidden'>{hdrs[11]}</button>
                    <button onClick={() => navigate('/trans')} className='mt-1 h-fit md:block hidden'>{hdrs[12]}</button>
                    <button onClick={() => navigate('/library')} className='mt-1 h-fit md:block hidden'>{hdrs[13]}</button>
                    <button onClick={() => navigate('/hosLanding')} className='mt-1 h-fit md:block hidden'>{hdrs[14]}</button>
                    <button onClick={() => navigate('/other-facilities')} className='mt-1 h-fit md:block hidden'>{hdrs[15]}</button>
                    <button onClick={() => navigate('/greviences')} className='mt-1 h-fit md:block hidden'>{hdrs[16]}</button>
                    <button className='truncate mt-1 h-fit md:block hidden' onClick={() => navigate('/login')}>{hdrs[17]}</button>

                    {/* Payment Button */}
                    <button 
                        onClick={() => window.location.href="https://easycollege.in/vecengg/college/webpayindex.aspx"} 
                        className="truncate mt-1 h-fit md:block hidden rounded-full bg-brwn text-white !dark:text-black dark:bg-drkt px-2">
    
                        {hdrs[18]}
                    </button>

                    {/* Social Icons */}
                    <div className="flex group items-center justify-end grow gap-3">
                        {socls.map((socl, i) => (
                            <a href={socl.Link} key={i}>
                                <img src={socl.Ico} alt={socl.Name}
                                    className="w-fit h-[1rem] group-[.showoff]:animate-[Social_2s_ease-in-out_forwards] 
                                                dark:invert mt-1 text-transparent"
                                    style={{ animationDelay: `${i * 1.9}s` }} />
                            </a>
                        ))}
                    </div>
                    
                </div>
                <div
                    className='block lg:hidden h-fit'>
                    <Sidebar navs={navs} Sz="tny p-0"/></div>
            </nav>
        </>
    )
}


export default Head;