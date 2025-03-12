import { useEffect, useState, useRef } from "react";
import { TfiControlBackward, TfiControlForward, TfiControlPause, TfiControlPlay } from "react-icons/tfi";
import "./IQAC.css";
import Banner from "../Banner";

// Add the missing UrlParser function
const UrlParser = (url) => {
    if (!url) return "";
    // Simple URL parser that ensures proper format
    // You can adjust this function based on your specific URL handling needs
    return url.startsWith("/") ? url : `/${url}`;
};

const IQAC = () => {
    const leftCardsRef = useRef([]);
    const rightCardsRef = useRef([]);
    const [isPlaying, setIsPlaying] = useState(true);
    const intervalRef = useRef(null);

    const [selectedYear, setSelectedYear] = useState("Objectives");
    const [selectedAction, setSelectedAction] = useState(null);
    const [iqacData, setIqacData] = useState(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data from a local source
        const fetchData = () => {
            const iicData = {
                _id: "67b40f5e2975e6716309cc19",
                imagepath: [
                    "/static/images/iic/image1.jpg",
                    "/static/images/iic/image2.jpg",
                    "/static/images/iic/image3.jpg",
                    "/static/images/iic/image4.jpg",
                    "/static/images/iic/image5.jpg",
                    "/static/images/iic/image6.jpg",
                    "/static/images/iic/image7.jpg",
                    "/static/images/iic/image8.jpg",
                    "/static/images/iic/image9.jpg",
                    "/static/images/iic/image10.jpg",
                    "/static/images/iic/image11.jpg",
                    "/static/images/iic/image12.jpg"
                ],
                events: {
                    year: ["2020 - 21", "2021 - 22", "2022 - 23", "2023 - 24"],
                    pdfpath: [
                        "/static/docs/iic/event1.pdf",
                        "/static/docs/iic/event2.pdf",
                        "/static/docs/iic/event3.pdf",
                        "/static/docs/iic/event4.pdf"
                    ]
                },
                policy: {
                    name: [
                        "National Innovation Startup Policy",
                        "Tamilnadu Innovation and Startup Policy",
                        "TNMSME Policy",
                        "Velammal Innovation and Startup Policy"
                    ],
                    pdfpath: [
                        "/static/docs/iic/policy1.pdf",
                        "/static/docs/iic/policy2.pdf",
                        "/static/docs/iic/policy3.pdf",
                        "/static/docs/iic/policy4.pdf"
                    ]
                },
                members: {
                    faculty: [
                        {
                            name: "Dr.A.Nirmal Raj",
                            designation: "HoD MBA",
                            role: "President",
                            imagepath: "/static/images/iic/faculty1.jpg"
                        },
                        {
                            name: "Dr.A.Balaji Ganesh",
                            designation: "Research Dean",
                            role: "Vice President",
                            imagepath: "/static/images/iic/faculty2.jpg"
                        },
                        {
                            name: "Mr.Viveak M Palanivasan",
                            designation: "Founder of Voltrix Mobility",
                            role: "Industry Expert",
                            imagepath: "/static/images/iic/faculty3.jpg"
                        },
                        {
                            name: "Member 4",
                            designation: "Designation",
                            role: "Industry Expert",
                            imagepath: "/static/images/iic/faculty4.jpg"
                        },
                        {
                            name: "Member 5",
                            designation: "Designation",
                            role: "Industry Expert",
                            imagepath: "/static/images/iic/faculty5.jpg"
                        },
                        {
                            name: "Member 6",
                            designation: "Designation",
                            role: "Industry Expert",
                            imagepath: "/static/images/iic/faculty6.jpg"
                        }
                    ],
                    // Added coordinator data
                    coordinator: {
                        name: "Dr. Jane Smith",
                        designation: "Professor, Dept of Computer Science",
                        role: "IQAC Coordinator",
                        email: "janesmith@example.edu",
                        phone: "+91 98765 43210",
                        imagepath: "/static/images/iic/coordinator.jpg"
                    }
                },
                NIR: {
                    RegistrationStatistics: {
                        name: [
                            "Total Individuals Registered",
                            "Total Ideas Submitted",
                            "Total Ideas Assigned",
                            "Total Ideas Verified",
                            "Total Ideas Recommended",
                            "Total Ideas Implemented"
                        ],
                        count: [2119, 265, 254, 250, 220, 180]
                    },
                    InnovationMetrics: {
                        name: [
                            "Patents Filed",
                            "Startups Incubated",
                            "Research Publications",
                            "Industry Collaborations",
                            "Funding Received",
                            "Mentorship Hours"
                        ],
                        count: [45, 32, 156, 28, "₹2.5Cr", 1200]
                    },
                    ImpactAssessment: {
                        name: [
                            "Student Participation",
                            "Faculty Involvement",
                            "Success Rate",
                            "Industry Adoption",
                            "Community Impact",
                            "Overall Rating"
                        ],
                        count: ["85%", "92%", "78%", "45%", "High", "4.8/5"]
                    }
                },
                otherstuffs: {
                    name: ["STARTUP", "SEED_MONEY", "MENTEE_INSTRUCTIONS", "PATENTS"],
                    path: [
                        "/static/docs/iic/startup.pdf",
                        "/static/docs/iic/seed_money.pdf",
                        "/static/docs/iic/mentee_instructions.pdf",
                        "/static/docs/iic/patents.pdf"
                    ]
                },
                // Added new data for the requested features
                objectives: {
                    about: "The Internal Quality Assurance Cell (IQAC) was established in 2004 as per the guidelines of the National Assessment and Accreditation Council (NAAC). The IQAC is responsible for developing, implementing, and continuously improving the quality systems within the institution.",
                    objectives: [
                        "To develop a system for conscious, consistent and catalytic action to improve the academic and administrative performance of the institution.",
                        "To promote measures for institutional functioning towards quality enhancement through internalization of quality culture and institutionalization of best practices.",
                        "To provide a sound basis for decision-making to improve institutional functioning.",
                        "To act as a dynamic system for quality changes in higher education."
                    ]
                },
                minutesOfMeetings: {
                    years: ["2021-22", "2022-23", "2023-24"],
                    paths: [
                        "/static/docs/iqac/minutes_2021-22.pdf",
                        "/static/docs/iqac/minutes_2022-23.pdf",
                        "/static/docs/iqac/minutes_2023-24.pdf"
                    ]
                },
                academicAdminAudit: {
                    years: ["2021-22", "2022-23", "2023-24"],
                    paths: [
                        "/static/docs/iqac/audit_2021-22.pdf",
                        "/static/docs/iqac/audit_2022-23.pdf",
                        "/static/docs/iqac/audit_2023-24.pdf"
                    ]
                },
                gallery: {
                    images: [
                        "/static/images/iqac/gallery1.jpg",
                        "/static/images/iqac/gallery2.jpg",
                        "/static/images/iqac/gallery3.jpg",
                        "/static/images/iqac/gallery4.jpg"
                    ],
                    captions: [
                        "IQAC Workshop on Quality Enhancement",
                        "Faculty Development Program",
                        "NAAC Peer Team Visit",
                        "Quality Improvement Seminar"
                    ]
                },
                strategicPlan: {
                    years: ["2021-25", "2025-30"],
                    paths: [
                        "/static/docs/iqac/strategic_plan_2021-25.pdf",
                        "/static/docs/iqac/strategic_plan_2025-30.pdf"
                    ]
                },
                bestPractices: {
                    years: ["2021-22", "2022-23", "2023-24"],
                    paths: [
                        "/static/docs/iqac/best_practices_2021-22.pdf",
                        "/static/docs/iqac/best_practices_2022-23.pdf",
                        "/static/docs/iqac/best_practices_2023-24.pdf"
                    ]
                },
                codeOfEthics: {
                    path: "/static/docs/iqac/code_of_ethics.pdf"
                },
                aqar: {
                    years: ["2020-21", "2021-22", "2022-23", "2023-24"],
                    paths: [
                        "/static/docs/iqac/aqar_2020-21.pdf",
                        "/static/docs/iqac/aqar_2021-22.pdf",
                        "/static/docs/iqac/aqar_2022-23.pdf",
                        "/static/docs/iqac/aqar_2023-24.pdf"
                    ]
                },
                isoCertificate: {
                    path: "/static/docs/iqac/iso_certificate.pdf"
                }
            };

            setIqacData(iicData);
            setLoading(false);
        };

        fetchData();
    }, []);

    // Update certificate, events, and policy arrays
    const certificateArray =
        iqacData?.certificate?.year?.map((year, index) => ({
            year,
            path: UrlParser(iqacData.certificate.pdfpath[index]),
        })) || [];

    const eventsOrganizedArray =
        iqacData?.events?.year?.map((year, index) => ({
            year,
            path: UrlParser(iqacData.events.pdfpath[index]),
        })) || [];

    const policyArray =
        iqacData?.policy?.name?.map((name, index) => ({
            year: name,
            path: UrlParser(iqacData.policy.pdfpath[index]),
        })) || [];

    // Update members array
    const membersArray =
        iqacData?.members?.faculty?.map((member) => ({
            name: member.name,
            image: UrlParser(member.imagepath),
            designation: member.designation,
            keyRole: member.role,
        })) || [];

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
        iqacData?.gallery?.images?.map((image, index) => ({
            image: UrlParser(image),
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
        setSelectedAction({ category, year });
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
                <div className="objectives-card">
                    <h3 className="objectives-heading">About IQAC</h3>
                    <p className="objectives-text">{iqacData?.objectives?.about}</p>
                </div>
                <div className="objectives-card">
                    <h3 className="objectives-heading">IQAC Objectives</h3>
                    <ul className="objectives-list">
                        {iqacData?.objectives?.objectives.map((objective, index) => (
                            <li key={index} className="objectives-item">{objective}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    // Render Coordinator content
    const renderCoordinatorContent = () => {
        return (
            <div className="coordinator-container">
                {coordinator && (
                    <div className="coordinator-card">
                        <div className="coordinator-image-container">
                            <img src={coordinator.image || "/placeholder.svg"} alt={coordinator.name} className="coordinator-image" />
                        </div>
                        <div className="coordinator-details">
                            <h3 className="coordinator-name">{coordinator.name}</h3>
                            <p className="coordinator-designation">{coordinator.designation}</p>
                            <p className="coordinator-role">{coordinator.keyRole}</p>
                            <p className="coordinator-email">Email: {coordinator.email}</p>
                            <p className="coordinator-phone">Phone: {coordinator.phone}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render Gallery content
    const renderGalleryContent = () => {
        return (
            <div className="gallery-container">
                <div className="gallery-grid">
                    {galleryArray.map((item, index) => (
                        <div key={index} className={`gallery-item gallery-item-${index + 1}`}>
                            <img src={item.image || "/placeholder.svg"} alt={item.caption} className="gallery-image" />
                            <p className="gallery-caption">{item.caption}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Banner
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                headerText="IQAC"
                subHeaderText="IQAC"
            />
            <div className="iqac-content">
                <div className="iqac-years">
                    {[
                        "Objectives", 
                        "Coordinator", 
                        "Members", 
                        "Minutes of Meetings",
                        "Academic and Administrative Audit",
                        "Gallery",
                        "Strategic Development Plan",
                        "Best Practices",
                        "Code of Ethics",
                        "AQAR",
                        "ISO Certificate",
                    ].map((category) => (
                        <button
                            key={category}
                            className={`iqac-year-button ${selectedYear === category ? "active bg-accn dark:bg-drka text-prim"
                                : "bg-secd dark:bg-drks text-[2px]"}`}
                            onClick={() => handleYearClick(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className={`nirf-details iqac-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                    height ${selectedYear === "Members" || selectedYear === "Coordinator" ? "members-section" : ""}
                    ${selectedYear === "Gallery" ? "gallery-section" : ""}
                    ${selectedYear === "Objectives" ? "iqac-objectives-section" : ""}`}>
                    {selectedYear === "NIR" ? (
                        renderNIRContent()
                    ) : selectedYear === "Objectives" ? (
                        renderObjectivesContent()
                    ) : selectedYear === "Coordinator" ? (
                        renderCoordinatorContent()
                    ) : selectedYear === "Gallery" ? (
                        renderGalleryContent()
                    ) : (
                        <div className="iqac-year-actions faculty-icc">
                            {/* {selectedYear === "Events Organized" &&
                                eventsOrganizedArray.map((action, index) => (
                                    <div
                                        key={index}
                                        className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka"
                                        onClick={() => openPdf("Events Organized", action.year)}
                                    >
                                        {action.year}
                                    </div>
                                ))}
                            {selectedYear === "Policy" &&
                                policyArray.map((action, index) => (
                                    <div key={index} className="nirf-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("Policy", action.year)}>
                                        {action.year}
                                    </div>
                                ))} */}
                            {selectedYear === "Members" && (
                                <div className="members-grid">
                                    {membersArray.map((member, index) => (
                                        <div key={index} className="members dark:bg-drkp">
                                            <img src={member.image || "/placeholder.svg"} alt={member.name} className="member-image" />
                                            <p className="text-secd dark:text-drks">{member.name}</p>
                                            <h6>{member.designation}</h6>
                                            <p>{member.keyRole}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedYear === "Minutes of Meetings" &&
                                minutesOfMeetingsArray.map((action, index) => (
                                    <div key={index} className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("Minutes of Meetings", action.year)}>
                                        {action.year}
                                    </div>
                                ))}
                            {selectedYear === "Academic and Administrative Audit" &&
                                academicAdminAuditArray.map((action, index) => (
                                    <div key={index} className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("Academic and Administrative Audit", action.year)}>
                                        {action.year}
                                    </div>
                                ))}
                            {selectedYear === "Strategic Development Plan" &&
                                strategicPlanArray.map((action, index) => (
                                    <div key={index} className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("Strategic Development Plan", action.year)}>
                                        {action.year}
                                    </div>
                                ))}
                            {selectedYear === "Best Practices" &&
                                bestPracticesArray.map((action, index) => (
                                    <div key={index} className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("Best Practices", action.year)}>
                                        {action.year}
                                    </div>
                                ))}
                            {selectedYear === "Code of Ethics" && (
                                <div className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("Code of Ethics", "Code of Ethics")}>
                                    Code of Ethics
                                </div>
                            )}
                            {selectedYear === "AQAR" &&
                                aqarArray.map((action, index) => (
                                    <div key={index} className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("AQAR", action.year)}>
                                        {action.year}
                                    </div>
                                ))}
                            {selectedYear === "ISO Certificate" && (
                                <div className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("ISO Certificate", "ISO Certificate")}>
                                    ISO Certificate
                                </div>
                            )}
                            {selectedYear === "Other Stuffs" &&
                                otherStuffsArray.map((action, index) => (
                                    <div key={index} className="iqac-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka" onClick={() => openPdf("Other Stuffs", action.year)}>
                                        {action.year}
                                    </div>
                                ))}
                        </div>
                    )}

                    {selectedAction && (
                        <div className="nirf-pdf-container iqac-pdf-container">
                            <h3 className="text-center">{`Viewing: ${selectedAction.year}`}</h3>
                            <embed
                                className="embed"
                                src={
                                    selectedAction.category === "Events Organized"
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
                                }
                                type="application/pdf"
                                width="100%"
                                height="600px"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default IQAC;