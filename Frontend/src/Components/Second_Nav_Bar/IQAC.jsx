import React, {useEffect, useState, useRef} from "react";
import "./IQAC.css";
import Banner from "../Banner";
import axios from "axios";
import SideNav from "./SideNav";
import {FaLink} from "react-icons/fa";
import LoadComp from "../LoadComp";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    // Return empty string if path is not a string
    if (typeof path !== 'string') return '';
    
    // Handle cases where path might be empty or undefined
    if (!path) return '';
    
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const IQAC = ({ toggle , theme }) => {
    const [selectedYear, setSelectedYear] = useState("Objectives");
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("OVERALL");
    const [iqacData, setIqacData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [iqa, setIqa] = useState("Objectives");
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
            }

        };

        fetchData();
    }, [iqa]);

    // Update certificate, events, and policy arrays
    const certificateArray =
        iqacData?.certificate?.year?.map((year, index) => ({
            year,
            path: UrlParser(iqacData?.certificate.path[index]),
        })) || [];

    const eventsOrganizedArray =
        iqacData?.events?.year?.map((year, index) => ({
            year,
            path: UrlParser(iqacData?.events.pdfpath[index]),
        })) || [];

    const policyArray =
        iqacData?.policy?.name?.map((name, index) => ({
            year: name,
            path: UrlParser(iqacData?.policy.pdfpath[index]),
        })) || [];

    // Create coordinator object
    const coordinator = iqacData ? {
        name: iqacData?.name,
        image: UrlParser(iqacData?.image_path),
        designation: iqacData?.designation,
        keyRole: iqacData?.role,
        email: iqacData?.email,
        phone: iqacData?.phone
    } : null;

    // Update NIR sections
    const nirSectionsArray = [
        {
            heading: "Registration Statistics",
            buttons:
                iqacData?.NIR?.RegistrationStatistics?.name?.map((name, index) => ({
                    text: `${name}: ${iqacData.NIR.RegistrationStatistics.count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
        {
            heading: "Innovation Metrics",
            buttons:
                iqacData?.NIR?.InnovationMetrics?.name?.map((name, index) => ({
                    text: `${name}: ${iqacData.NIR.InnovationMetrics.count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
        {
            heading: "Impact Assessment",
            buttons:
                iqacData?.NIR?.ImpactAssessment?.name?.map((name, index) => ({
                    text: `${name}: ${iqacData.NIR.ImpactAssessment.count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
    ];

    // Update other stuffs array
    const otherStuffsArray =
        iqacData?.otherstuffs?.name?.map((name, index) => ({
            year: name,
            path: UrlParser(iqacData.otherstuffs.path[index]),
        })) || [];

    // Create new arrays for the added features
    const minutesOfMeetingsArray = Array.isArray(iqacData)
        ? iqacData?.map((year) => ({
            year: year.year,
            path: UrlParser(year.path),
            }))
        : [];

    const academicAdminAuditArray =
        iqacData?.academicAdminAudit?.years?.map((year, index) => ({
            year,
            path: UrlParser(iqacData.academicAdminAudit.paths[index]),
        })) || [];

    const galleryArray =
        iqacData?.gallery?.images?.map((images, index) => ({
            image: UrlParser(images),
            caption: iqacData.gallery.captions[index],
        })) || [];

    const strategicPlanArray =
        iqacData?.strategicPlan?.years?.map((year, index) => ({
            year,
            path: UrlParser(iqacData.strategicPlan.paths[index]),
        })) || [];

    const bestPracticesArray = Array.isArray(iqacData)
        ? iqacData?.map((year) => ({
            year: year.year,
            path: UrlParser(year.path),
            }))
        : [];


    const aqarArray = Array.isArray(iqacData)
        ? iqacData?.map((year) => ({
            year: year.year,
            path: UrlParser(year.path),
            }))
        : [];

    const openPdf = (category, year) => {
        setSelectedAction({category, year});
    };

    const handleYearClick = (year) => {
        setSelectedYear(year);
        setSelectedAction(null);
    };

    const renderNIRContent = () => {
        return (
            <div className="nir-container">
                <h2>National Innovation Repository (NIR)</h2>
                {nirSectionsArray.map((section, index) => (
                    <div key={index} className="nir-section">
                        <h3 className="nir-heading">{section.heading}</h3>
                        <div className="nir-buttons">
                            {section.buttons.map((button, btnIndex) => (
                                <div key={btnIndex} className="iic-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim
                                    dark:hover:bg-drka rounded-xl border-2 border-accn dark:border-drka">
                                    {button.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render Objectives content
    const  renderObjectivesContent = () => {
        return (
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
        );
    };

    // Render Coordinator content
    const renderCoordinatorContent = () => {
        return (
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
        );
    };

    // Render Gallery content
    const renderGalleryContent = () => {
    // Assuming iqacData.gallery is your array
    const galleryData = iqacData || [];

    // Extract all categories
    const categories = galleryData.map(item => item.category);

    // Find the object matching the selectedCategory
    const selectedItem = galleryData.find(item => item.category === selectedCategory);

    return (
        <div className="mr-4">
            <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">Gallery</h2>

            <div className="flex flex-wrap gap-2 justify-center mb-4">
                {categories.map((category) => (
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
                {selectedItem?.paths?.map((imagePath, index) => (
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
        );
    }

    function IqaMet() {
        return (
            <div className="flex flex-wrap justify-center text-xl my-4 gap-8">
                <h2 className={"basis-full text-brwn dark:text-drkt text-center text-[24px]"}>Minutes of Meetings</h2>
                {minutesOfMeetingsArray.map((action, index) => (
                    <a key={index} href={`${action.path}#toolbar=0`} target="_blank" rel="noopener noreferrer"
                         className="hover:underline hover:text-text dark:hover:text-drkt dark:text-drka"
                         // onClick={() => openPdf("Minutes of Meetings", action.year)}
                    >
                        <FaLink className={"inline size-5 mr-1 mb-1"} />{action.year}
                    </a>
                ))}
            </div>
        );
    }

    function IqaAud() {
        return (
            <>
            <h2 className="basis-full text-brwn dark:text-drkt text-center text-[24px] mt-[15px]">
                Academic and Administrative Audit
            </h2>
            <div className="flex justify-center p-4 w-full">
                <div className="overflow-x-auto border rounded-lg shadow-md">
                <table className="w-[1000px] department-table">
                    <thead className="bg-gry">
                    <tr>
                        <th className="text-left px-4 py-2 text-text w-2">S.No</th>
                        <th className="text-left px-4 py-2 text-text">Departments</th>
                        <th className="text-left px-4 py-2 text-text">Reports</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array.isArray(iqacData) &&
                        iqacData?.map((dept, deptIndex) => (
                        <tr key={deptIndex}>
                            <td className="text-center w-2">{deptIndex + 1}</td>
                            <td>{dept?.department_name}</td>
                            <td>
                            <ul className="reportlist">
                                {dept?.path?.map((rep, repIndex) => (
                                <li key={repIndex}>
                                    <a
                                    href={rep || "#"}
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
        );
    }

    function IqaGal() {
        return renderGalleryContent();
    }

    function IqaDev() {
        return (
            <div className="nirf-pdf-container iqac-pdf-container">
                <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt mb-4"}>Strategic development plan</h2>

                <embed
                    className="embed"
                    src={UrlParser(iqacData[0]?.paths) + "#toolbar=0"
                    }
                    type="application/pdf"
                    width="100%"
                    height="600px"
                />
            </div>
        );
    }

    function IqaIns() {
        return (
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
        )
    }

    function IqaPra() {
        return (
            <div className="flex flex-wrap justify-center  text-xl my-4 gap-8">
                <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt"}>Best Practices</h2>
                {bestPracticesArray.map((action, index) => (
                    <a key={index} href={`${action.path}#toolbar=0`} target="_blank" rel="noopener noreferrer"
                       className="hover:underline hover:text-text dark:hover:text-drkt dark:text-drka"
                        // onClick={() => openPdf("Academic and Administrative Audit", action.year)}
                    >
                        <FaLink className={"inline size-5 mr-1 mb-1"}/>{action.year}
                    </a>
                ))}
            </div>
        );
    }

    function IqaEth() {
        return (
            <div className="nirf-pdf-container iqac-pdf-container">
                    <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt"}>Code of Ethics</h2>
                    <embed
                        className="embed"
                        src={UrlParser(iqacData[0]?.path) + "#toolbar=0"}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                    />
                </div>
        );
    }

    function IqaQar() {
        return (
            <div className="flex flex-wrap justify-center  text-xl my-4 gap-8">
                <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt"}>AQAR</h2>
                {aqarArray.map((action, index) => (
                    <a key={index} href={`${action.path}#toolbar=0`} target="_blank" rel="noopener noreferrer"
                       className="hover:underline hover:text-text dark:hover:text-drkt dark:text-drka"
                    >
                        <FaLink className={"inline size-5 mr-1 mb-1"}/>{action.year}
                    </a>
                ))}
            </div>
        );
    }

    function IqaIso() {
        return (
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
        );
    }

    function IqaPdf() {
        return (
            <div className={`nirf-details iqac-details basis-full dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                    height ${selectedYear === "Members" || selectedYear === "Coordinator" ? "members-section" : ""}
                    ${selectedYear === "Gallery" ? "gallery-section" : ""}
                    ${selectedYear === "Objectives" ? "iqac-objectives-section" : ""}`}>
                {selectedYear === "NIR" ? (
                    renderNIRContent()
                ) : (selectedAction && (
                    <div className="nirf-pdf-container iqac-pdf-container">
                        <h3 className="text-center">{`Viewing: ${selectedAction.year}`}</h3>
                        <embed
                            className="embed"
                            src={UrlParser(
                                (selectedAction.category === "Events Organized"
                                        ? eventsOrganizedArray.find((item) => item.year === selectedAction.year)?.path
                                        : selectedAction.category === "Policy"
                                            ? policyArray.find((item) => item.year === selectedAction.year)?.path
                                            : selectedAction.category === "Minutes of Meetings"
                                                ? minutesOfMeetingsArray.find((item) => item.year === selectedAction.year)?.path
                                                : selectedAction.category === "Academic and Administrative Audit"
                                                    ? academicAdminAuditArray.find((item) => item.year === selectedAction.year)?.path
                                                    : selectedAction.category === "Strategic Development Plan"
                                                        ? strategicPlanArray.find((item) => item.year === selectedAction.year)?.path
                                                        : selectedAction.category === "Best Practices"
                                                            ? bestPracticesArray.find((item) => item.year === selectedAction.year)?.path
                                                            : selectedAction.category === "Code of Ethics"
                                                                ? iqacData?.codeOfEthics?.path
                                                                : selectedAction.category === "AQAR"
                                                                    ? aqarArray.find((item) => item.year === selectedAction.year)?.path
                                                                    : selectedAction.category === "ISO Certificate"
                                                                        ? iqacData?.isoCertificate?.path
                                                                        : otherStuffsArray.find((item) => item.year === selectedAction.year)?.path
                                )) + "#toolbar=0"
                            }
                            type="application/pdf"
                            width="100%"
                            height="600px"
                        />
                    </div>
                ))}
            </div>
        )
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