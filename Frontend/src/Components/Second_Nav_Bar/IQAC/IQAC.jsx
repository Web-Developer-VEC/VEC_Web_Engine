import React, {useEffect, useState, useRef} from "react";
import "./IQAC.css";
import Banner from "../../Banner";
import axios from "axios";
import SideNav from "../SideNav";
import LoadComp from "../../LoadComp";
import { useNavigate } from "react-router";


const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    // Return empty string if path is not a string
    if (typeof path !== 'string') return '';
    
    // Handle cases where path might be empty or undefined
    if (!path) return '';
    
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const IQAC = ({ toggle , theme }) => {
    const [selectedCategory, setSelectedCategory] = useState("OVERALL");
    const [iqacData, setIqacData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [iqa, setIqa] = useState("Objectives");
    const navigate = useNavigate();
    const navData = {
        "Objectives": <IqaObj/>,
        "Coordinator": <IqaCor/>,
        "Members": <IqaMem/>,
        "Minutes of Meetings": <IqaMet/>,
        "Academic and Administrative Audit": <IqaAud/>,
        "Gallery": <IqaGal/>,
        "Strategic Development Plan": <IqaDev/>,
        "Best Practices": <IqaPra/>,
        "Institutional Distinctiveness": <IqaIns/>,
        "Code of Ethics": <IqaEth/>,
        "AQAR": <IqaQar/>,
        "ISO Certificate": <IqaIso/>,
    };

    useEffect(() => {

        const typeMatch = {
            "Objectives": "objectives",
            "Coordinator": "coordinator",
            "Members": "members",
            "Minutes of Meetings": "minutes_of_meetings",
            "Academic and Administrative Audit": "academic_admin_audit",
            "Gallery": "gallery",
            "Strategic Development Plan": "strategic_plan",
            "Best Practices": "best_practices",
            "Institutional Distinctiveness": "institutional_distinctiveness",
            "Code of Ethics": "code_of_ethics",
            "AQAR": "aqar",
            "ISO Certificate": "iso_certificate"
        }
        // Simulate fetching data from a local source
        const fetchData = async () => {
            setIqacData(null);
            try {
                const response = await axios.post('/api/main-backend/iqac',
                    {
                        type: typeMatch[iqa]
                    }
                );
                setIqacData(response.data.data);
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
                if (error.response.data.status === 429) {
                    navigate('/ratelimit', { state: { msg: error.response.data.message}})
                } 
            }

        };

        fetchData();
    }, [iqa]);

    // Create coordinator object
    const coordinator = iqacData ? {
        name: iqacData?.name,
        image: UrlParser(iqacData?.image_path),
        designation: iqacData?.designation,
        keyRole: iqacData?.role,
        email: iqacData?.email,
        phone: iqacData?.phone
    } : null;

    // Render Objectives content
    const  renderObjectivesContent = () => {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <div className="objectives-container">
                    <div className="objectives-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="objectives-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About IQAC</h3>
                        <p className="objectives-text text-text dark:text-drkt">{iqacData?.about}</p>
                    </div>
                    <div className="objectives-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="objectives-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">IQAC Objectives</h3>
                        <ul className="objectives-list">
                            {iqacData?.objectives?.map((objective, index) => (
                                <li key={index} className="objectives-item text-text dark:text-drkt">{objective}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            </>
        );
    };

    // Render Coordinator content
    const renderCoordinatorContent = () => {
        return (
            <>
                {!coordinator ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <LoadComp />
                    </div>
                ) : (
                    <div className="coordinator-container flex-wrap">
                        <h2 className="text-[24px] text-center text-accn dark:text-drkt my-4 basis-full">IQAC Coordinator</h2>
                        {coordinator && (
                            <div className="coordinator-card ">
                                <div className="coordinator-image-container w-500px h-auto">
                                    <img src={UrlParser(coordinator.image) || "/placeholder.svg"} alt={coordinator.name}
                                        className="coordinator-image"/>
                                </div>
                                <div className="coordinator-details w-full">
                                    <h3 className="coordinator-name text-text dark:text-drkt">{coordinator.name}</h3>
                                    <p className="coordinator-designation text-brwn dark:text-drka">{coordinator.designation}</p>
                                    <p className="coordinator-role text-brwn dark:text-drka">{coordinator.keyRole}</p>
                                    <p className="coordinator-email">Email: <a className="text-drka">{coordinator.email}</a></p> 
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    };

    // Render Gallery content
    const renderGalleryContent = () => {
    // Assuming iqacData.gallery is your array
    let galleryData;

    if (iqacData) {
        galleryData = iqacData || [];
    }

    // Extract all categories
    const categories = Array.isArray(galleryData) && galleryData?.map(item => item?.category);

    // Find the object matching the selectedCategory
    const selectedItem = Array.isArray(galleryData) && galleryData?.find(item => item?.category === selectedCategory);

    return (
        <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <div className="mr-4">
                    <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">Gallery</h2>
        
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {Array.isArray(categories) && categories?.map((category) => (
                        <button
                            key={category}
                            className={`px-4 py-1 text-lg font-semibold rounded-lg transition-colors duration-300 ${
                            selectedCategory === category
                                ? "bg-accn text-white"
                                : "bg-secd dark:bg-drks"
                            }`}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                        ))}
                    </div>
        
                    <div className="columns-xs mb-12">
                        {Array.isArray(selectedItem?.paths) && selectedItem?.paths?.map((imagePath, index) => (
                        <img
                            key={imagePath}
                            src={UrlParser(imagePath)}
                            alt={`Gallery Image ${index + 1}`}
                            className={`size-0 block box-border m-2 animate-[fadBorn_1s_ease_forwards]`}
                            style={{ animationDelay: `${100 * index}ms` }}
                        />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
    };

    function IqaObj() {
        return renderObjectivesContent();
    }

    function IqaCor() {
        return renderCoordinatorContent();
    }

    function IqaMem() {
        const parser = {
            chairperson: "Chairperson",
            deansanddepartmentheads: "Deans and Department Heads",
            seniorteachers: "Senior Teachers",
            memberfrommanagement: "Member from Management",
            localprofessionalsocietychapter: "Local Professional Society Chapter",
            studentmembers: "Student Members",
            aluminimembers: "Alumni Members",
            memberfromemployee: "Member from Employee",
            memberfromindustry: "Member from Industry",
            stakeholders: "Stakeholders",
        };

        return (
            <>
                {!iqacData ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <LoadComp />
                    </div>
                ) : (
                    <div className="mt-8 mb-4 px-4">
                        {Array.isArray(iqacData) && (
                            <>
                                {iqacData?.map((group, idx) => {
                                    const title = parser[group.category?.toLowerCase()] || group.category;
                                    return (
                                    <div key={idx} className="mb-10">
                                        {/* Group Title */}
                                        <h2 className="text-2xl font-semibold font-poppins mb-4 text-center text-accn dark:text-drkt">
                                            {title}
                                        </h2>
                    
                                        {/* Members */}
                                        <div className="flex flex-wrap gap-4">
                                        {group.members?.map((member, i) => {
                                            const isLast = i === group.members.length - 1;
                                            const isOdd = group.members.length % 2 !== 0;
                    
                                            return (
                                            <div
                                                key={i}
                                                className={`
                                                ${
                                                    group.members.length === 1
                                                    ? "basis-full max-w-xl mx-auto"
                                                    : isLast && isOdd
                                                    ? "md:basis-[48%] md:mx-auto"
                                                    : "md:basis-[48%]"
                                                } 
                                                py-2 px-4 rounded-xl border-l-4 border-secd dark:border-drks
                                                bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                                                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                                                transition-colors duration-300 ease-in basis=full w-full
                                                `}
                                            >
                                                <p className="text-xl font-poppins">{member.name}</p>
                                                {member.designation && (
                                                    <p className="text-sm text-accn dark:text-drka">
                                                        {member.designation}
                                                    </p>
                                                )}
                                                {member.role && (
                                                    <p className="text-sm text-accn dark:text-drka">
                                                        {member.role}
                                                    </p>
                                                )}
                                            </div>
                                            );
                                        })}
                                        </div>
                                    </div>
                                    );
                                })}
                            
                            </>
                        )}
                    </div>
                )}
            </>
        );
    }

    function IqaMet() {
        return (
            <>
                {!iqacData ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <LoadComp />
                    </div>
                ) : (
                <>
                    <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px] mt-[15px]">
                        Minutes of Meetings
                    </h2>
                    <div className="flex justify-center p-4 w-full">
                        <div className="overflow-x-auto border rounded-lg shadow-md">
                        <table className="w-[1000px] department-table">
                            <thead className="bg-gry">
                            <tr>
                                <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                                <th className="text-center px-4 py-2 text-text">Year</th>
                                <th className="text-center px-4 py-2 text-text">ODD /EVEN</th>
                                <th className="text-center px-4 py-2 text-text">Conducted On</th>
                                <th className="text-center px-4 py-2 text-text">Links</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Array.isArray(iqacData) &&
                                iqacData?.map((dept, deptIndex) => (
                                <tr key={deptIndex}>
                                    <td className="text-center w-2">{deptIndex + 1}</td>
                                    <td className="text-center">{dept?.year}</td>
                                    <td className="text-center">{dept?.type}</td>
                                    <td className="text-center">{dept?.conducted_on}</td>
                                    <td className="text-center">
                                        <a
                                            href={UrlParser(dept?.path) || "#"}
                                            target={dept?.path ? "_blank" : ""}
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                        View PDF
                                        </a>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </>
                )}
            </>
        );
    }

    function IqaAud() {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <>
                <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px] mt-[15px]">
                    Academic and Administrative Audit
                </h2>
                <div className="flex justify-center p-4 w-full">
                    <div className="overflow-x-auto border rounded-lg shadow-md">
                    <table className="w-[1000px] department-table">
                        <thead className="bg-gry">
                        <tr>
                            <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                            <th className="text-center px-4 py-2 text-text">Departments</th>
                            <th className="text-center px-4 py-2 text-text">Reports</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(iqacData) &&
                            iqacData?.map((dept, deptIndex) => (
                            <tr key={deptIndex}>
                                <td className="text-center w-2">{deptIndex + 1}</td>
                                <td>{dept?.department_name}</td>
                                <td className="text-center">
                                <ul className="reportlist">
                                    {Array.isArray(dept?.path) && dept?.path?.map((rep, repIndex) => (
                                    <li key={repIndex}>
                                        <a
                                            href={UrlParser(rep) || "#"}
                                            target={rep ? "_blank" : ""}
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                        {dept?.year[repIndex]}
                                        </a>
                                    </li>
                                    ))}
                                </ul>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                </>
            )}
            </>
        );
    }

    function IqaGal() {
        return renderGalleryContent();
    }

    function IqaDev() {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <div className="nirf-pdf-container iqac-pdf-container">
                    <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt mb-4"}>Strategic development plan</h2>

                    <embed
                        className="embed"
                        src={UrlParser(Array.isArray(iqacData) && iqacData[0]?.paths) + "#toolbar=0"
                        }
                        type="application/pdf"
                        width="100%"
                        height="600px"
                    />
                </div>
            )}
            </>
        );
    }

    function IqaIns() {
        return (
            <>
                {!iqacData ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <LoadComp />
                    </div>
                ) : (
                <div className="nirf-pdf-container iqac-pdf-container">
                    <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt"}>Institutional Distinctiveness</h2>

                    <embed
                        className="embed"
                        src={UrlParser(iqacData[0]?.path) + "#toolbar=0"}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                    />
                </div>
                )}
            </>
        )
    }

    function IqaPra() {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <>
                <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px] mt-[15px]">
                    Best Practices
                </h2>
                <div className="flex justify-center p-4 w-full">
                    <div className="overflow-x-auto border rounded-lg shadow-md">
                    <table className="w-[800px] department-table">
                        <thead className="bg-gry">
                        <tr>
                            <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                            <th className="text-center px-4 py-2 text-text">Year</th>
                            <th className="text-center px-4 py-2 text-text">Best Practices</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(iqacData) &&
                            iqacData?.map((dept, deptIndex) => (
                            <tr key={deptIndex}>
                                <td className="text-center w-2">{deptIndex + 1}</td>
                                <td className="text-center">{dept?.year}</td>
                                <td>
                                <ul className="reportlist">
                                    {Array.isArray(dept?.title) && dept?.title?.map((title, repIndex) => (
                                    <li key={repIndex}>
                                        <a
                                            href={UrlParser(dept?.path) || "#"}
                                            target={dept?.path ? "_blank" : ""}
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline cursor-pointer"
                                        >
                                        {title}
                                        </a>
                                    </li>
                                    ))}
                                </ul>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                </>
            )}
            </>
        );
    }

    function IqaEth() {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <div className="nirf-pdf-container iqac-pdf-container">
                    <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt"}>Code of Ethics</h2>
                    <embed
                        className="embed"
                        src={UrlParser(Array.isArray(iqacData) && iqacData[0]?.path) + "#toolbar=0"}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                    />
                </div>
            )}
            </>
        );
    }

    function IqaQar() {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <>
                <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px] mt-[15px]">
                    AQAR
                </h2>
                <div className="flex justify-center p-4 w-full">
                    <div className="overflow-x-auto border rounded-lg shadow-md">
                    <table className="w-[600px] department-table">
                        <thead className="bg-gry">
                        <tr>
                            <th className="text-center px-4 py-2 text-text w-2">S.No</th>
                            <th className="text-center px-4 py-2 text-text">Year</th>
                            <th className="text-center px-4 py-2 text-text">Links</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(iqacData) &&
                            iqacData?.map((aqar, deptIndex) => (
                            <tr key={deptIndex}>
                                <td className="text-center w-2">{deptIndex + 1}</td>
                                <td className="text-center">{aqar?.year}</td>
                                <td className="text-center">
                                    <a
                                        href={UrlParser(aqar?.path) || "#"}
                                        target={aqar?.path ? "_blank" : ""}
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline cursor-pointer"
                                    >
                                    View PDF
                                    </a>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                </>
            )}
            </>
        );
    }

    function IqaIso() {
        return (
            <>
            {!iqacData ? (
                <div className="flex justify-center items-center min-h-screen">
                    <LoadComp />
                </div>
            ) : (
                <div className="nirf-pdf-container iqac-pdf-container">
                    <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt"}>ISO Certificate</h2>
                    <embed
                        className="embed"
                        src={UrlParser(iqacData[0]?.path) + "#toolbar=0"
                        }
                        type="application/pdf"
                        width="100%"
                        height="600px"
                    />
                </div>
            )}
            </>
        );
    }
    
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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
    return (
        <>
            <Banner
                toggle={toggle} theme={theme}
                backgroundImage="./Banners/IQAC_Banner.webp"
                headerText="IQAC"
                subHeaderText="IQAC"
            />
            <div className="">

                <SideNav sts={iqa} setSts={setIqa} navData={navData} cls={""}/>
            </div>
        </>
    );
};

export default IQAC;