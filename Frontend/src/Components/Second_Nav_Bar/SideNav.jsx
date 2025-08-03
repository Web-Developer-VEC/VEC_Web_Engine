import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUserTie,
    FaChalkboardTeacher,
    FaBook,
    FaBuilding,
    FaTasks,
    FaGraduationCap,
    FaUsers,
    FaHandshake,
    FaEye,
    FaNewspaper,
    FaThLarge,
    FaBullseye,
    FaCalendarAlt,
    FaClipboardCheck,
    FaImages,
    FaRoad,
    FaThumbsUp,
    FaBalanceScale,
    FaFileAlt,
    FaCertificate,
    FaHome,
    FaCalendarDay,
    FaUserGraduate,
    FaAward,
    FaTrophy,
    FaStar,
    FaNetworkWired,
    FaPhoneAlt,
    FaChevronRight,
    FaCalendarCheck,
    FaRocket,
    FaLifeRing,
    FaWarehouse,
    FaCheckCircle,
    FaShieldAlt,
    FaAnchor,
    FaInfoCircle,
    FaListAlt,
    FaMapMarkedAlt,
    FaPlusCircle,
    FaMap,
    FaListUl,
    FaIdCard,
    FaExchangeAlt,
    FaColumns,
    FaVideo,
    FaPlusSquare,
    FaListOl,
    FaHeart,
    FaJournalWhills,
    FaCogs,
    FaDesktop,
    FaSearch, FaDownload, FaClock, FaBookOpen, FaSignOutAlt, FaRunning,
    FaIdBadge,
    FaUniversity,
    FaFileContract,
    FaLightbulb,
    FaUserCog,
    FaFolderOpen,
    FaCoins,
    FaUserAstronaut,
    FaClipboardList,
    FaEnvelopeOpenText, 
} from "react-icons/fa";
import { ArrowBigLeft, BrainCircuit, CalendarClock, Shell, Trophy, UserCog } from "lucide-react";
import { FingerPrintIcon } from "@heroicons/react/24/solid";
import { FaUserGear } from "react-icons/fa6";

const SideNav = ({sts, setSts, navData, cls, backButton=false}) => {
    const navigate = useNavigate();
    function setIco(ttl) {
        const sty = "size-4 group-hover:text-text text-secd dark:text-drks inline mr-1 mb-1"
        switch (ttl) {
            case "Vision & Mission":
                return <FaEye className={sty}/>;
            case "Objectives":
                return <FaBullseye className={sty}/>;
            case "Coordinator":
                return <FaUserTie className={sty}/>;
            case "NAAC":
                return <Trophy className={sty}/>;
            case "NIRF":
                return <Trophy className={sty}/>;
            case "NBA":
                return <Trophy className={sty}/>;
            case "QS Rating":
                return <Trophy className={sty}/>;
            case "Code of Ethics":
                return <FaBalanceScale className={sty}/>;
            case "Strategic Development Plan":
                return <FaRoad className={sty}/>;
            case "Best Practices":
                return <FaThumbsUp className={sty}/>;
            case "Student Achievments":
                return <FaGraduationCap className={sty}/>;
            case "Members":
                return <FaUsers className={sty}/>;
            case "AQAR":
                return <FaFileAlt className={sty}/>;
            case "ISO Certificate":
                return <FaCertificate className={sty}/>;
            case "Academic and Administrative Audit":
                return <FaClipboardCheck className={sty}/>;
            case "Minutes of Meetings":
                return <FaCalendarAlt className={sty}/>;
            case "Gallery":
                return <FaImages className={sty}/>;
            case "Home":
                return <FaHome className={sty}/>;
            case "Establishment of IIC":
                return <FaCalendarDay className={sty}/>;
            case "Faculty":
                return <FaChalkboardTeacher className={sty}/>;
            case "Expert Representation":
                return <FaUserTie className={sty}/>;
            case "Student Representation":
                return <FaUserGraduate className={sty}/>;
            case "Calender":
                return <FaCalendarAlt className={sty}/>;
            case "IIC 4.0":
                return <FaStar className={sty}/>;
            case "IIC 5.0":
                return <FaStar className={sty}/>;
            case "IIC 3.0":
                return <FaStar className={sty}/>;
            case "IIC 7.0":
                return <FaStar className={sty}/>;
            case "IIC 8.0":
                return <FaStar className={sty}/>;
            case "IIC 6.0":
                return <FaStar className={sty}/>;
            case "I & E Ecosystem":
                return <FaNetworkWired className={sty}/>;
            case "Contact":
                return <FaPhoneAlt className={sty}/>;
            case "Council":
                return <FaUsers className={sty}/>;
            case "Events":
                return <FaCalendarCheck className={sty}/>;
            case "Incubated Startups":
                return <FaRocket className={sty}/>;
            case "MOU's":
                return <FaHandshake className={sty}/>;
            case "Student Support Mechanism":
                return <FaLifeRing className={sty}/>;
            case "Facilities":
                return <FaWarehouse className={sty}/>;
            case "Mentor's":
                return <FaUserTie className={sty}/>;
            case "Apply Now":
                return <FaCheckCircle className={sty}/>;
            case "NSS Manual":
                return <FaBook className={sty}/>;
            case "Distinguished Alumini":
                return <FaUserGraduate className={sty}/>;
            case "About NCC Army":
                return <FaShieldAlt className={sty}/>;
            case "About NCC Navy":
                return <FaAnchor className={sty}/>;
            case "About":
                return <FaInfoCircle className={sty}/>;
            case "About E-cell":
                return <FaInfoCircle className={sty}/>;
            case "Activities":
                return <FaTasks className={sty}/>;
            case "Introduction":
                return <FaInfoCircle className={sty}/>;
            case "Action Plan":
                return <FaListAlt className={sty}/>;
            case "Infrastructure":
                return <FaBuilding className={sty}/>;
            case "Achievements":
                return <FaTrophy className={sty}/>;
            case "Zonal results":
                return <FaMapMarkedAlt className={sty}/>;
            case "Our Winners":
                return <FaUsers className={sty}/>;
            case "Other":
                return <FaPlusCircle className={sty}/>;
            case "Overview":
                return <FaInfoCircle className={sty}/>;
            case "HOD's message":
                return <FaUserTie className={sty}/>;
            case "Advisory committee members":
                return <FaUsers className={sty}/>;
            case "Floor overview":
                return <FaMap className={sty}/>;
            case "Features":
                return <FaListUl className={sty}/>;
            case "General Instructions":
                return <FaListOl className={sty}/>;
            case "Membership details":
                return <FaIdCard className={sty}/>;
            case "Borrowing & Circulation":
                return <FaExchangeAlt className={sty}/>;
            case "Library Sections":
                return <FaColumns className={sty}/>;
            case "Library Highlights":
                return <FaStar className={sty}/>;
            case "Multimedia library":
                return <FaVideo className={sty}/>;
            case "New Arrivals":
                return <FaPlusSquare className={sty}/>;
            case "Library Resources":
                return <FaBook className={sty}/>;
            case "News & Updates":
                return <FaNewspaper className={sty}/>;
            case "Recent Events":
                return <FaCalendarAlt className={sty}/>;
            case "Team & Coordinators":
                return <FaUsers className={sty}/>;
            case "Awards & Recognition":
                return <FaAward className={sty}/>;
            case "About NSS":
                return <FaInfoCircle className={sty}/>;
            case "About YRC":
                return <FaHeart className={sty}/>;
            case "Staff":
                return <FaUsers className={sty}/>;
            case "Books":
                return <FaBook className={sty}/>;
            case "Journals":
                return <FaJournalWhills className={sty}/>;
            case "Newspapers":
                return <FaNewspaper className={sty}/>;
            case "Services":
                return <FaCogs className={sty}/>;
            case "Digital Library & E-Resources":
                return <FaDesktop className={sty}/>;
            case "OPAC":
                return <FaSearch className={sty}/>;
            case "Collection":
                return <FaColumns className={sty}/>;
            case "Downloads":
                return <FaDownload className={sty}/>;
            case "Warden details":
                return <FaUserTie className={sty}/>;
            case "Mess Timings":
                return <FaClock className={sty}/>;
            case "Study Hours":
                return <FaBookOpen className={sty}/>;
            case "General info":
                return <FaInfoCircle className={sty}/>;
            case "Leave":
                return <FaSignOutAlt className={sty}/>;
            case "Intra Mural":
                return <FaRunning className={sty}/>;
            case "Team Captains":
                return <FaUsers className={sty}/>;
            case "Annual reports":
                return <FaFileAlt className={sty}/>;
            case "Contact Us":
                return <FaPhoneAlt className={sty}/>;
            case "About Hostel":
                return <FaHome className={sty}/>;
            case "Hostel Facilities":
                return <FaBuilding className={sty}/>;
            case "Digital Hostel":
                return <Shell className={sty}/>
            case "Membership Details":
                return <FaIdBadge className={sty}/>
            case "Institutional Distinctiveness":
                return <FaUniversity className={sty}/>
            case "Event Organized":
                return <CalendarClock className={sty}/>
            case "Policy":
                return <FaFileContract className={sty}/>
            case "Certificate":
                return <FaCertificate className={sty}/>
            case "Kapila":
                return <FaLightbulb className={sty}/>
            case "Mentee Institution":
                return <FaChalkboardTeacher className={sty}/>
            case "Yukti":
                return <BrainCircuit className={sty}/>
            case "Committee":
                return <FaUserCog className={sty}/>
            case "Project":
                return <FaFolderOpen className={sty}/>
            case "Patents":
                return <FingerPrintIcon className={sty}/>
            case "Seed Money":
                return <FaCoins className={sty}/>
            case "E-Cell":
                return <FaUserTie className={sty}/>
            case "Enterpreneur":
                return <FaUserAstronaut className={sty}/>
            case "Activity":
                return <FaClipboardList className={sty}/>
            case "Enquiry Now":
                return <FaEnvelopeOpenText className={sty}/>
            case "Pilot":
                return <UserCog className={sty}/>
            case "Co-Pilot":
                return <FaUserGear className={sty}/>
            default:
                return <FaThLarge className={sty}/>;
        }
    }

    return (
        <div className={cls + " grid w-screen grid-cols-10 -mt-10 md:-mt-4 lg:-mt-2 *:px-2"}>
            <nav className="bg-black pt-4 pb-12 flex gap-y-2 gap-x-2 flex-wrap
                lg:grid text-md h-full content-start col-start-0 col-span-10 lg:col-span-2
                transition-all duration-300 ease-in-out">
                {backButton && (
                    <button
                        onClick={() => navigate(-1)} // 👈 go back to previous page
                        className="px-4 py-2 m-2 text-prim hover:text-text rounded hover:bg-secd dark:bg-drks dark:hover:bg-drks/80 transition-colors w-fit flex "
                    >
                        <ArrowBigLeft/> Back
                    </button>
                )}
                {Object.keys(navData).map((itm, ind) => (
                    (Object.keys(navData[itm]).length <= 5 && Object.keys(navData[itm])[0] !== "$$typeof") ?
                    <label className={`px-4 py-2 border-secd dark:border-drks min-w-1/2 
                            text-prim hover:bg-secd dark:hover:bg-drks hover:text-text dark:hover:text-drkt 
                            has-[:checked]:bg-secd/20 rounded-lg 
                            has-[:checked]:dark:bg-drks has-[:checked]:text-prim has-[:checked]:dark:text-drkp
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${(ind + 1 === Object.keys(navData).length) ? "" : "lg:border-b-transparent"}`}
                               key={ind}
                        >{setIco(itm)}{itm}
                            <input type={"checkbox"} className="peer size-0 checked:mb-3"/>
                            <FaChevronRight className="size-4 float-right mt-1 peer-[:checked]:rotate-90
                                transition-transform duration-300 ease"/>
                            {/*<ul className="hidden lg:grid w-fit lg:max-w-[15vw] text-xl border-2">*/}
                            {Object.keys(navData[itm]).map((obj, inx) => (
                                <li className={`px-4 py-2 rounded-lg mt-2
                                        transition-all duration-300 ease-in-out animate-[fadIn_0.5s_ease_forwards]
                                        dark:hover:bg-drka hidden peer-checked:block hover:text-text dark:hover:text-drkt
                                        ${(sts[1] === obj) ? "bg-secd dark:bg-drks text-text dark:text-drkt font-semibold " +
                                    "hover:bg-secd dark:hover:bg-drks" : "hover:bg-secd dark:hover:bg-drks"}
                                        ${(inx + 1 === Object.keys(navData[itm]).length) ? "" : "lg:border-b-transparent"}
                                        `}
                                    key={inx} type={"button"} onClick={(e) => {
                                    setSts([itm, obj]);
                                    e.target.parentElement.children[1].checked = false
                                }}
                                    style={{animationDelay: `${inx * 100}ms`}}>{setIco(obj)}{obj}</li>
                            ))}
                            {/*</ul>*/}
                        </label>
                        :
                        <button className={`px-4 py-2 border-secd dark:border-drks rounded-lg text-start h-fit
                            text-prim transition-all duration-300 ease-in-out hover:text-text dark:hover:text-drkt
                            group self-stretch
                            ${(sts === itm) ? "bg-secd dark:bg-drks text-text dark:text-drkt font-semibold " +
                            "hover:bg-secd dark:hover:bg-drks" : "hover:bg-secd dark:hover:bg-drks"}
                            `
                        } key={ind}
                                type={"button"} onClick={() => setSts(itm)}>{setIco(itm)}{itm}</button>
                    // ${(ind + 1 !== Object.keys(navData).length) ? "" : "lg:border-b-transparent"}
                ))}
            </nav>
            <div className="col-span-10 lg:col-span-8 overflow-hidden">
                {(Array.isArray(sts)) ? navData[sts[0]][sts[1]] : navData[sts]}
            </div>
        </div>
    )
}

export default SideNav