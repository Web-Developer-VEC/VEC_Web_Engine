import React, {useEffect, useState, useRef} from "react";
import {TfiControlBackward, TfiControlForward, TfiControlPause, TfiControlPlay} from "react-icons/tfi";
import "./IQAC.css";
import Banner from "../Banner";
import axios from "axios";
import SideNav from "./SideNav";
import {FaLink} from "react-icons/fa";
import LoadComp from "../LoadComp";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
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
        "Academic and Administrative Audit": <IqaAud/>, //IqaAud
        "Gallery": <IqaGal/>,
        "Strategic Development Plan": <IqaDev/>,
        "Best Practices": <IqaPra/>,
        "Institutional Distinctiveness": <IqaIns/>,
        "Code of Ethics": <IqaEth/>,
        "AQAR": <IqaQar/>,
        "ISO Certificate": <IqaIso/>,
    };

    useEffect(() => {
        // Simulate fetching data from a local source
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/iqac');
                setIqacData(response.data.data[0]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
            }

        };

        fetchData();
    }, []);

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

    // Update members array
    // const membersArray =
    //     iqacData?.members?.faculty?.map((member) => ({
    //         name: member.name,
    //         image: UrlParser(member.imagepath),
    //         designation: member.designation,
    //         keyRole: member.role,
    //     })) || [];

    // Create coordinator object
    const coordinator = iqacData?.members?.coordinator ? {
        name: iqacData.members.coordinator.name,
        image: UrlParser(iqacData.members.coordinator.imagepath),
        designation: iqacData.members.coordinator.designation,
        keyRole: iqacData.members.coordinator.role,
        email: iqacData.members.coordinator.email,
        phone: iqacData.members.coordinator.phone
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
    const minutesOfMeetingsArray =
        iqacData?.minutesOfMeetings?.years?.map((year, index) => ({
            year,
            path: UrlParser(iqacData.minutesOfMeetings.paths[index]),
        })) || [];

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

    const bestPracticesArray =
        iqacData?.bestPractices?.years?.map((year, index) => ({
            year,
            path: UrlParser(iqacData.bestPractices.paths[index]),
        })) || [];


    const aqarArray =
        iqacData?.aqar?.years?.map((year, index) => ({
            year,
            path: UrlParser(iqacData.aqar.paths[index]),
        })) || [];

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
    const renderObjectivesContent = () => {
        return (
            <div className="objectives-container">
                <div className="objectives-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                    <h3 className="objectives-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About IQAC</h3>
                    <p className="objectives-text text-text dark:text-drkt">{iqacData?.objectives?.about}</p>
                </div>
                <div className="objectives-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                    <h3 className="objectives-heading text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">IQAC Objectives</h3>
                    <ul className="objectives-list">
                        {iqacData?.objectives?.objectives.map((objective, index) => (
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
                        <div className="coordinator-image-container max-w-[25vmax] h-auto">
                            <img src={UrlParser(coordinator.image_path) || "/placeholder.svg"} alt={coordinator.name}
                                 className="coordinator-image"/>
                        </div>
                        <div className="coordinator-details w-full">
                            <h3 className="coordinator-name text-text dark:text-drkt">{coordinator.name}</h3>
                            <p className="coordinator-designation text-brwn dark:text-drka">{coordinator.designation}</p>
                            <p className="coordinator-role text-brwn dark:text-drka">{coordinator.keyRole}</p>
                            <p className="coordinator-email">Email: <a className="text-drka">{coordinator.email}</a></p> 
                            {/* <p className="coordinator-phone">Phone: <a href={`tel:${coordinator.phone}`} className="text-drka">{coordinator.phone}</a></p> */}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render Gallery content
    const renderGalleryContent = () => {

        const galleryData = iqacData?.gallery;
    
        const categories = Object.keys(galleryData);
    
        return (
            <div className="mr-4">
                <h2 className="text-2xl text-center text-brwn dark:text-drkt my-4">Gallery</h2>
                
                {/* Category Buttons */}
                <div className="flex gap-2 justify-center mb-4">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`bg-secd dark:bg-drksl px-4 text-lg font-semibold rounded-lg ${selectedCategory === category ? "gallery-selected text-white" : "bg-secd"}`}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
    
                {/* Image Gallery */}
                <div className="columns-xs mb-12">
                    {galleryData[selectedCategory].map((imagePath, index) => (
                        <img
                            key={imagePath}
                            src={UrlParser(imagePath)}
                            alt={`Gallery Image ${index + 1}`}
                            className={`size-0 block box-border m-2 ${
                                selectedCategory === "OVERALL" || galleryData[selectedCategory].includes(imagePath)
                                    ? "animate-[fadBorn_1s_ease_forwards]"
                                    : "animate-[fadKill_1s_ease_forwards]"
                            }`}
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
            principle: "Chairperson",
            deansanddepartmentheads: "Deans and Department Heads",
            seniorteachers: "Senior Teachers",
            memberfrommanagement: "Member from Management",
            localprofessionalsocietychapter: "Local Professional Society Chapter",
            studentmembers: "Student Members",
            aluminimembers: "Alumni Members",
            memberfromemployes: "Member from Employee",
            memberfromindustry: "Member from Industry",
            stakeholders: "Stakeholders"
        };
        return (
        <div className="mt-8 mb-4 px-4">
            {Object.entries(iqacData?.members?.faculty).map(([groupKey, members]) => (
            <div key={groupKey} className="mb-10">
                {/* Group Title */}
                <h2 className="text-2xl font-semibold font-poppins mb-4 text-center text-accn dark:text-drkt">
                {parser[groupKey]}
                </h2>

                {/* Group Members */}
                <div className="flex flex-wrap gap-4">
                {members.map((member, i) => {
                    const isLast = i === members.length - 1;
                    const isOdd = members.length % 2 !== 0;
                    return (

                        <div
                        key={i}
                        className={ `
                            ${members.length === 1
                            ? 'basis-full max-w-xl mx-auto'
                            : isLast && isOdd
                                ? 'md:basis-[48%] md:mx-auto' // Center last card on its row
                                : 'md:basis-[48%]'} 
                            py-2 px-4 rounded-xl border-l-4 border-secd dark:border-drks
                            bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                            transition-colors duration-300 ease-in basis=full w-full
                        `}
                        >
                        <p className="text-xl font-poppins">{member.name}</p>
                        {member.designation && (
                            <p className="text-sm text-accn dark:text-drka">{member.designation}</p>
                        )}
                        {member.role && (
                            <p className="text-sm text-accn dark:text-drka">{member.role}</p>
                        )}
                        </div>
                    )
    })}
                </div>
            </div>
            ))}
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
            // <div className="flex flex-wrap justify-center  text-xl my-4 gap-8">
            //     <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt"}>Academic and Administrative Audit</h2>
            //     {academicAdminAuditArray.map((action, index) => (
            //         <a key={index} href={`${action.path}#toolbar=0`} target="_blank" rel="noopener noreferrer"
            //              className="hover:underline hover:text-text dark:hover:text-drkt dark:text-drka"
            //              // onClick={() => openPdf("Academic and Administrative Audit", action.year)}
            //         >
            //             <FaLink className={"inline size-5 mr-1 mb-1"} />{action.year}
            //         </a>
            //     ))}
            // </div>
            <div className="flex justify-center p-4 w-full">
                <div className="overflow-x-auto border rounded-lg shadow-md">
                    <table className=" w-[1000px] department-table">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left px-4 py-2 text-text">Departments</th>
                            <th className="text-left px-4 py-2 text-text">Reports</th>
                            <th className="text-left px-4 py-2 text-text">Minutes</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>AI & DS</td>
                                <td>AI & DS</td>
                                <td>AI & DS</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
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
                    src={UrlParser(iqacData?.strategicPlan?.paths[0]) + "#toolbar=0"
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
                    src={UrlParser(iqacData?.institutional_distinctiveness?.path) + "#toolbar=0"
                    }
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
                        src={UrlParser(iqacData?.codeOfEthics?.path) + "#toolbar=0"
                        }
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
                        // onClick={() => openPdf("Academic and Administrative Audit", action.year)}
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
                    src={UrlParser(iqacData?.isoCertificate?.path) + "#toolbar=0"
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
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
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