import {useState, useEffect} from "react";
import {Bars3Icon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/solid";
import {Link, useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import Inta from '../Assets/instagram.png'
import Fcbk from '../Assets/facebook.png'
import Twtr from '../Assets/twitter.png'
import Lknd from '../Assets/linkedin.png'
import {sup} from "framer-motion/m";

// Import Framer Motion // Import Framer Motion
const Sidebar = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (isOpen && activeIndex !== null) {
            setTitle(navs[activeIndex].main);
        }
    }, [isOpen, activeIndex]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    
        return () => {
            document.body.style.overflow = "auto"; // Cleanup when component unmounts
        };
    }, [isOpen]);    

    const navigate = useNavigate();
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

    const navs = props.navs
    const spHdrs = [{ttl: "Fee Payments", lnk: 'https://easycollege.in/vecengg/college/webpayindex.aspx'},
         {ttl: "Student Login", lnk: 'https://vecchennai.org/studentlogin/login.php?done=/studentlogin/'}, {ttl: "Faculty Login", lnk: "https://vecchennai.org/stafflogin/login.php?done=/stafflogin/"}]
    const hdrs1 = [
        "velammal@velammal.edu.in", "+91 99566 00420"
    ];

    const hdrs = [
        { text: "NBA", link: "/nba" },
        { text: "NAAC", link: "/naac" },
        { text: "NIRF", link: "/nirf" },
        { text: "IIC", link: "/iic" },
        { text: "Incubation Cell", link: "/incubation" },
        { text: "Alumni", link: "/alumni" },
        { text: "NSS", link: "/nss" },
        { text: "NCC", link: "/ncc" },
        { text: "YRC", link: "/yrc" },
        { text: "Sports", link: "/sports" },
        { text: "Transport", link: "/transport" },
        { text: "Library", link: "/library" },
        { text: "Hostel", link: "/hoslanding" },
        { text: "Other Facilities", link: "/other-facilities" },
         {text: "Help desk", link: '/grievances'}
      ]


    return (
        <div>
            {/* Sidebar Open Button */}
            <button onClick={() => setIsOpen(true)} className={`fixed top-2 right-2 z-50 bg-gray-900 text-white p-2 
            rounded-lg shadow-xl transition-all duration-300 
            ${isOpen ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}>
                <Bars3Icon className="size-[3vmax]"/>
            </button>

            {/* Background Overlay */}
            <motion.div className="fixed inset-0 bg-black/60" initial={{opacity: 0}} animate={{opacity: isOpen ? 1 : 0}}
                        transition={{duration: 0.4, ease: "easeInOut"}} onClick={() => setIsOpen(false)}
                        style={{pointerEvents: isOpen ? "auto" : "none"}}/>

            {/* Sidebar */}
            <motion.div
                className="fixed top-0 right-0 h-full w-72 bg-gray-900 text-white shadow-2xl p-4 flex flex-col z-50"
                initial={{x: "100%", opacity: 0.5, scale: 0.98}}
                animate={{x: isOpen ? 0 : "100%", opacity: isOpen ? 1 : 0.5, scale: isOpen ? 1 : 0.98}}
                transition={{ease: "easeInOut", duration: 0.45}}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                    {activeIndex !== null ? (
                        <button onClick={() => {
                            setActiveIndex(null);
                            // setTitle("")
                        }} className="text-gray-400 hover:text-gray-200 transition flex items-center">
                            <ChevronLeftIcon className="w-6 h-6"/> {title}
                        </button>
                    ) : (
                        <h2 className="text-lg font-semibold">Navigation</h2>
                    )}
                    {!activeIndex && (
                        <button onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-200 transition">
                            <XMarkIcon className="w-6 h-6"/>
                        </button>
                    )}
                </div>

                {/* Navigation List */}
                <div
                    className="overflow-y-auto flex-1 mt-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                    {activeIndex === null ? (
                        <ul className="space-y-2 list-none">
                            {navs.map((nav, i) => (
                                <motion.li key={i} initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}}
                                           transition={{duration: 0.3, delay: i * 0.08, ease: "easeInOut"}}>
                                    <button onClick={() => setActiveIndex(i)}
                                            className="flex justify-between items-center w-full text-sm font-medium py-2 px-3 rounded-md bg-gray-800 hover:bg-gray-700 transition">
                                        {nav.main}
                                        <ChevronRightIcon className="w-4 h-4"/>
                                    </button>
                                </motion.li>
                            ))}
                        </ul>

                    ) : (
                        <div>
                            <ul className="space-y-2 pl-4 border-l-2 border-gray-600/50">
                                {navs[activeIndex].sub.map((sub, idx) => (
                                    (sub.sup.length === 0) ?
                                        <motion.li key={idx} initial={{opacity: 0, x: 10}} animate={{opacity: 1, x: 0}}
                                                   transition={{duration: 0.2, delay: idx * 0.08, ease: "easeInOut"}}>
                                            {sub.hrd ? (
                                                <h3 className="text-sm font-semibold text-gray-200 my-1">{sub.ttl}</h3>
                                            ) : (
                                                <Link to={sub.lnk}
                                                  target="_blank"           
                                                    rel="noopener noreferrer"
                                                      className="block text-gray-400 hover:text-white transition-all py-2 px-3 rounded-md bg-gray-800/50 hover:bg-gray-700 backdrop-blur-md shadow-sm border border-gray-700/30"
                                                      onClick={() => {
                                                          setIsOpen(false);
                                                      }}>
                                                    {sub.ttl}
                                                </Link>
                                            )}
                                        </motion.li>
                                        : <div className="my-4">
                                            <h3 className="text-xs font-semibold text-gray-200 mb-1">{sub.ttl}</h3>
                                            {sub.sup.map((spj, ix) => (
                                                <motion.li key={spj.ttl + ix} initial={{opacity: 0, x: 10}} className="mb-2"
                                                           animate={{opacity: 1, x: 0}}
                                                           transition={{
                                                               duration: 0.2,
                                                               delay: ix * 0.08,
                                                               ease: "easeInOut"
                                                           }}>
                                                    {spj.hrd ? (
                                                        <h3 className="text-sm font-semibold text-gray-200 mt-2">{spj.ttl}</h3>
                                                    ) : (
                                                        <Link to={spj.lnk}
                                                              className="block text-gray-400 hover:text-white transition-all py-2 px-3 rounded-md bg-gray-800/50 hover:bg-gray-700 backdrop-blur-md shadow-sm border border-gray-700/30"
                                                              onClick={() => {
                                                                  setIsOpen(false);
                                                              }}>
                                                            {spj.ttl}
                                                        </Link>
                                                    )}
                                                </motion.li>
                                            ))}
                                        </div>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                {/* Footer Section */}
                <div className="border-t border-gray-700 mt-2 pt-2">
                    <div className="flex flex-col space-y-1 text-gray-400 text-xs">
                        <div className="flex items-center gap-2">
                            {/* <p className="truncate">{hdrs1[0]}</p> */}
                            <a href={`mailto:${hdrs1[0]}`} className="text-white no-underline">{hdrs1[0]}</a>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <p>{hdrs1[1]}</p> */}
                            <a href={`tel:${hdrs1[1]}`} className="text-white no-underline">{hdrs1[1]}</a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-3 gap-2 border-b border-gray-700 mt-3 pb-3 text-xs text-gray-300">
                        {spHdrs.map((item, index) => (
                            <motion.button
                                key={index}
                                onClick={() => {
                                    if (item.lnk.startsWith("http")) {
                                        window.open(item.lnk, "_blank");  
                                    } else {
                                        navigate(item.lnk);  // Navigate internally
                                    }
                                    setIsOpen(false);
                                }}
                                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md transition text-center"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.05, ease: "easeInOut" }}>
                                {item.ttl}
                            </motion.button>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-300">
                        {hdrs.map((item, index) => (
                            <motion.button
                                key={index}
                                onClick={() => {
                                    navigate(`${item.link}`)
                                    setIsOpen(false);
                                }}
                                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md transition text-center"
                                initial={{opacity: 0, scale: 0.95}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{duration: 0.2, delay: index * 0.05, ease: "easeInOut"}}>
                                {item.text}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Social Media Links */}
                <div className="mt-2 flex justify-center space-x-4">
                    {socls.map((social, index) => (
                        <a key={index} href={social.Link} target="_blank" rel="noopener noreferrer"
                           className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition">
                            <img src={social.Ico} alt={social.Name}
                                 className={`w-3 h-3 ${social.Fltr} filter brightness-0 invert`}/>
                        </a>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Sidebar;