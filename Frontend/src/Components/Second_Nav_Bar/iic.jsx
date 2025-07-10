import {TfiControlBackward, TfiControlForward, TfiControlPause, TfiControlPlay} from "react-icons/tfi";
import {useEffect, useState, useRef, act} from "react"
import axios from "axios"
import "./iic.css"
import Banner from "../Banner"
import SideNav from "./SideNav";
import LoadComp from "../LoadComp";

function IicHome() {
    return (<div className="naac-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb iic-box">
        <h1 className="text-accn dark:text-drkt text-[32px]">Home</h1>
        <h2 className="text-[24px] text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1 naac-about">About IIC</h2>
        <p className="text-text dark:text-drkt">
            The Ministry of Education (MoE), Govt. of India has established 'MoE's Innovation Cell (MIC)' to
            systematically foster the culture of Innovation amongst all Higher Education Institutions (HEIs). The
            primary mandate of MIC is to encourage, inspire and nurture young students by supporting them to work with
            new ideas and transform them into prototypes while they are in their formative years.
            <br/>
            MIC has envisioned encouraging creation of 'Institution's Innovation Council (IICs)' across selected HEIs. A
            network of these IICs will be established to promote innovation in the Institutions through multitudinous
            modes leading to an innovation promotion eco-system in the campuses.
        </p>
    </div>);
}

function IicEst() {
    return (<div className="about-section">
        <div><h1 className="text-brwn dark:text-drkt text-4xl font-bold text-center">Establishment of IIC</h1></div>

        <div className="naac-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb">
            <h2 className="text-[30px] text-brwn dark:text-drkt iic-establishment border-b-2 border-secd dark:border-drks pb-1">Major Focus of IIC</h2>
            <p>
                <br/>• To create a vibrant local innovation ecosystem, Start-up supporting Mechanism in HEIs, IIC should
                prepare the institution for ATAL Ranking of Institutions on Innovation Achievements Framework.
                <br/>• To establish a Function Ecosystem for Scouting Ideas and Pre-incubation of Ideas.
                <br/>• To develop better Cognitive Ability for Technology Students.
                <br/>
            </p>
        </div>

       <div className="flex flex-col lg:flex-row justify-between gap-6">
    {/* Left Panel */}
    <div className="iqac-info-panel border-l-4 border-secd dark:border-drks w-full lg:w-1/2 dark:bg-drkb">
        <h2 className="text-[30px] text-brwn dark:text-drkt iic-establishment border-b-2 border-secd dark:border-drks pb-1">Vision</h2>
        <p>
            To facilitate a conducive environment with the intention of making an innovation to reach the society or
            industries for the betterment of our country and its citizen through entrepreneurial assets.
        </p>
    </div>

    {/* Right Panel */}
    <div className="iqac-info-panel border-l-4 border-secd dark:border-drks w-full lg:w-1/2 dark:bg-drkb">
        <h2 className="text-[30px] iic-establishment border-b-2 border-secd dark:border-drks pb-1 text-brwn dark:text-drkt">Mission</h2>
        <p>
            To enable student and faculty to establish a start-up to market their innovative products; an enhanced
            coordination and priority setting across the start-up eco-system; an improved customizable strategy and
            planning for pursuing productivity growth and better operational efficiencies and value for the start-up
            companies.
        </p>
    </div>z
</div>

    </div>);
}

function IicExp({ iicData }) {
    return (
        <>
            {iicData ? (
                <h1 className="text-accn text-4xl text-center font-bold">
                    Expert Representative
                </h1>
            ) : (
                <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
                    <LoadComp />
                </div>
            )}
        </>
    );
}


function IicRep({iicData}) {
        return (
        <>
            {iicData ? (
                <h1 className="text-accn text-4xl">Student Representative</h1>
            ) : (
                <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
                    <LoadComp />
                </div>
            )}
        </>
    );
}

function IicFir({iicData}) {
    return (
        <>{iicData?(<h1 className="text-accn text-4xl">IIC 1.0</h1>):(
             <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
        )}</>
    );
}

function IicSec({iicData}) {
    return ( <>{iicData?(<h1 className="text-accn text-4xl">IIC 2.0</h1>):(
             <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
        )}</>
    );
}

function IicThd({iicData}) {
    return (<>{iicData?(<h1 className="text-accn text-4xl">IIC 3.0</h1>):(
             <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
        )}</>
    );
}

function IicEco() {
    return (<div className="mb-10">
        <div className="card-plc functions-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb">
            <h1 className="text-accn dark:text-drkt text-4xl">I & E Ecosystem</h1>
            <h2 className="text-[30px] iic-eco">Functions of IIC</h2>
            <p>
                <br/>• To conduct various innovation and entrepreneurship-related activities prescribed by Central MIC
                in a
                time-bound manner.
                <br/>• To identify and reward innovations and share success stories.
                <br/>• To organize periodic workshops/ seminars/ interactions with entrepreneurs, investors,
                professionals
                and create a mentor pool for student innovators.
                <br/>• Networking with peers and national entrepreneurship development organizations.
                <br/>• To create an Institution's Innovation portal to highlight innovative projects carried out by
                institution's faculty and students.
                <br/>• To organize Hackathons, idea competitions, mini-challenges etc. with the involvement of
                industries.
                <br/>
            </p>
        </div>
    </div>);
}

function IicCon({iicData}) {
    return (
       <>
       {
       iicData?( <h1 className="text-accn text-4xl">Contacts</h1>):( <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>)
       }
       </>
    );
}

const Iic = ({toggle, theme}) => {
    const leftCardsRef = useRef([])
    const rightCardsRef = useRef([])
    const [isPlaying, setIsPlaying] = useState(true)
    const intervalRef = useRef(null);
    const navData = {
        "Home": <IicHome/>,
        "Establishment of IIC": <IicEst/>,
        "Council": {
            "Faculty": <IicHome/>,  //IicFac
            "Expert Representation": <IicHome/>,    //IicExp
            "Student Representation": <IicHome/>    //IicExp
        },
        "Calender": <IicHome/>, //IicCal
        "Gallery": <IicHome/>,  //IicGal
        "Events": {
            "IIC 1.0": <IicHome/>,  //IicFir
            "IIC 2.0": <IicHome/>,  //IicSec
            "IIC 3.0": <IicHome/>   //IicThd
        },
        "I & E Ecosystem": <IicEco/>,
        "Contact": <IicHome/>   //IicCon
    }
    const [iic, setIic] = useState(Object.keys(navData)[0])

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    const leftPerspectives = [
        {x: -6, z: -4},
        {x: -12, z: -8},
        {x: -18, z: -12},
        {x: -24, z: -16},
        {x: -30, z: -20},
        {x: 6, z: -4},
    ]

    const rightPerspectives = [
        {x: 6, z: -4},
        {x: 12, z: -8},
        {x: 18, z: -12},
        {x: 24, z: -16},
        {x: 30, z: -20},
        {x: -6, z: -4},
    ]

    const translateImage = (target, p) => {
        if (target) {
            target.style.transform = `translate3d(${p.x}rem, 0, ${p.z}rem)`
        }
    }

    const animateCards = (element, perspectives) => {
        if (element) {
            const count = Number.parseInt(element.dataset.counter, 10)
            const newCount = count === 6 ? 1 : count + 1

            // Ensure newCount is within valid index range
            if (newCount - 1 < 0 || newCount - 1 >= perspectives.length) {
                console.error("Index out of bounds:", newCount - 1)
                return
            }

            translateImage(element, perspectives[newCount - 1])
            element.dataset.counter = newCount.toString()
        }
    }

    const loop = () => {
        return setInterval(() => {
            leftCardsRef.current.forEach((card) => {
                animateCards(card, leftPerspectives)
            })
            rightCardsRef.current.forEach((card) => {
                animateCards(card, rightPerspectives)
            })
        }, 2000)
    }

    const initializeCards = () => {
        leftCardsRef.current.forEach((card, index) => {
            translateImage(card, leftPerspectives[index])
            card.dataset.counter = (index + 1).toString()
        })
        rightCardsRef.current.forEach((card, index) => {
            translateImage(card, rightPerspectives[index])
            card.dataset.counter = (index + 1).toString()
        })
    }

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying)
        if (isPlaying) {
            clearInterval(intervalRef.current)
        } else {
            intervalRef.current = loop()
        }
    }

    const [isAnimating, setIsAnimating] = useState(false);

    const moveNext = () => {
        if (isAnimating) return; // Prevent multiple clicks during animation
        setIsAnimating(true);

        clearInterval(intervalRef.current);

        leftCardsRef.current.forEach((card) => {
            animateCards(card, leftPerspectives);
        });

        rightCardsRef.current.forEach((card) => {
            animateCards(card, rightPerspectives);
        });

        setTimeout(() => {
            intervalRef.current = loop();
            setIsAnimating(false);
        }, 500); // Delay must match the CSS transition time
    };

    const movePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        clearInterval(intervalRef.current);

        leftCardsRef.current.forEach((card) => {
            if (!card) return;

            const count = Number.parseInt(card.dataset.counter, 10);
            let newCount = count === 1 ? 6 : count - 1;

            translateImage(card, leftPerspectives[newCount - 1]);
            card.dataset.counter = newCount.toString();
        });

        rightCardsRef.current.forEach((card) => {
            if (!card) return;

            const count = Number.parseInt(card.dataset.counter, 10);
            let newCount = count === 1 ? 6 : count - 1;

            translateImage(card, rightPerspectives[newCount - 1]);
            card.dataset.counter = newCount.toString();
        });

        setTimeout(() => {
            intervalRef.current = loop();
            setIsAnimating(false);
        }, 500);
    };

    useEffect(() => {
        initializeCards()
        intervalRef.current = loop()
        return () => clearInterval(intervalRef.current)
    }, []) // Removed dependencies as they're not needed

    const [selectedYear, setSelectedYear] = useState("Certificate")
    const [selectedAction, setSelectedAction] = useState(null)
    const [iicData, setIicData] = useState(null)
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/iic`)
                setIicData(response.data)
                setLoading(false)
            } catch (error) {
                console.error("Error fetching data:", error.message)
                setLoading(true)
            }
        }
        fetchData()
    }, []);

    // Update the image gallery
    const imageLeft = iicData?.imagepath?.slice(0, 6) || []
    const imageRight = iicData?.imagepath?.slice(6, 12) || []

    // Update certificate, events, and policy arrays
    const certificateArray =
        iicData?.certificate?.year?.map((year, index) => ({
            year,
            path: UrlParser(iicData.certificate.pdfpath[index]),
        })) || []

    const eventsOrganizedArray =
        iicData?.events?.year?.map((year, index) => ({
            year,
            path: UrlParser(iicData.events.pdfpath[index]),
        })) || []

    const policyArray =
        iicData?.policy?.name?.map((name, index) => ({
            year: name,
            path: UrlParser(iicData.policy.pdfpath[index]),
        })) || []

    // Update members array
    const membersArray =
        iicData?.members?.faculty?.map((member) => ({
            name: member.name,
            image: UrlParser(member.imagepath),
            designation: member.designation,
            keyRole: member.role,
        })) || []

    // Update NIR sections
    const nirSectionsArray = [
        {
            heading: "Registration Statistics",
            buttons:
                iicData?.NIR?.["Registration Statistics"]?.name?.map((name, index) => ({
                    text: `${name}: ${iicData.NIR["Registration Statistics"].count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
        {
            heading: "Innovation Metrics",
            buttons:
                iicData?.NIR?.["Innovation Metrics"]?.name?.map((name, index) => ({
                    text: `${name}: ${iicData.NIR["Innovation Metrics"].count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
        {
            heading: "Impact Assessment",
            buttons:
                iicData?.NIR?.["Impact Assessment"]?.name?.map((name, index) => ({
                    text: `${name}: ${iicData.NIR["Impact Assessment"].count[index]}`,
                    path: `/pdfs/${name.replace(/\s+/g, "-")}.pdf`,
                })) || [],
        },
    ]

    // Update other stuffs array
    const otherStuffsArray =
        iicData?.otherstuffs?.name?.map((name, index) => ({
            year: name,
            path: UrlParser(iicData.otherstuffs.path[index]),
        })) || []

    const openPdf = (category, year) => {
        setSelectedAction({category, year})
    }

    const handleYearClick = (year) => {
        setSelectedYear(year)
        setSelectedAction(null)
    }

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
                  dark:hover:bg-brwn rounded-xl border-2 border-accn dark:border-drka">
                                    {button.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    function IicCal() {
        return (
           <>{iicData?(
            <div
                className="fuck md:card"
                onMouseEnter={() => clearInterval(intervalRef.current)} // Stop auto-scroll on hover
                onMouseLeave={() => {
                    if (isPlaying) intervalRef.current = loop(); // Resume auto-scroll only if playing
                }}
            >
                <h1 className="text-accn dark:text-drkt text-4xl">Calender</h1>
                <h3 className="iic-faici">Facilities And Infrastructure</h3>
                <div className="gallery">
                    <div className="left iic-left">
                        <div className="inner">
                            {imageLeft?.map((src, index) => (
                                <img
                                    key={src}
                                    ref={(el) => (leftCardsRef.current[index] = el)}
                                    className="item"
                                    src={UrlParser(src)}
                                    data-counter={(index + 1).toString()}
                                    alt={`Left card ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="right iic-right">
                        <div className="inner">
                            {imageRight?.map((src, index) => (
                                <img
                                    key={UrlParser(src)}
                                    ref={(el) => (rightCardsRef.current[index] = el)}
                                    className="item"
                                    src={src || "/placeholder.svg"}
                                    data-counter={(index + 1).toString()}
                                    alt={`Right card ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>):(
                <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
                    <LoadComp />
                </div>
            )}
            </>
        )
    }

    function IicGal({issData}) {
        return (
            <>
            {issData ? ( 
                <div className="carousel-controls">
                <h1 className="text-accn text-4xl">Gallery</h1>
                <button
                    className={`carousel-button bg-secd dark:text-prim dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka`}
                    onClick={movePrev}
                >
                    <TfiControlBackward/>
                </button>
                {/* <button
                className={`carousel-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka ${isPlaying ? 'active' : ''}`}
                onClick={togglePlayPause}
              >
                {isPlaying ? <TfiControlPause /> : <TfiControlPlay />}
              </button> */}
                <button
                    className={`carousel-button bg-secd dark:bg-drks dark:text-prim hover:bg-accn hover:text-prim dark:hover:bg-drka`}
                    onClick={moveNext}
                >
                    <TfiControlForward/>
                </button>
            </div> ):(<div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>)}
        
            </>
        );
    }

    const [selected , setSelected] = useState(null);

    function IicFac() {
        return (

            <>
                {iicData ? (

                <div className="nirf-content">
                    <h1 className="text-accn text-4xl">Faculty</h1>
                    <div className="nirf-years">
                        {["Certificate", "Events Organized", "Policy", "Members", "NIR", "Other Stuffs"].map((category) => (
                            <button
                                key={category}
                                className={`nirf-year-button ${selectedYear === category ? "active bg-accn dark:bg-drka text-prim"
                                    : "bg-secd dark:bg-drks text-[2px]"}`}
                                onClick={() => handleYearClick(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    
                    <div className={`nirf-details dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                height ${selectedYear === "Members" ? "members-section" : ""}`}>
                        {selectedYear === "NIR" ? (
                            renderNIRContent()
                        ) : (
                            <div className="nirf-year-actions faculty-icc">
                                {selectedYear === "Certificate" &&
                                    certificateArray.map((action, index) => (
                                        <div key={index} className=" text-[10px] nirf-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim
                            dark:hover:bg-drka" onClick={() => openPdf("Certificate", action.year)}>
                                            {action.year}
                                        </div>
                                    ))}
                                {selectedYear === "Events Organized" &&
                                    eventsOrganizedArray.map((action, index) => (
                                        <div
                                            key={index}
                                            className="nirf-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka"
                                            onClick={() => openPdf("Events Organized", action.year)}
                                        >
                                            {action.year}
                                        </div>
                                    ))}
                                {selectedYear === "Policy" &&
                                    policyArray.map((action, index) => (
                                        <div key={index}
                                            className="nirf-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka"
                                            onClick={() => openPdf("Policy", action.year)}>
                                            {action.year}
                                        </div>
                                    ))}
                                {selectedYear === "Members" && (
                                    <div className="members-grid">
                                        {membersArray.map((member, index) => (
                                            <div key={index} className="members dark:bg-drkp">
                                                <img src={member.image || "/placeholder.svg"} alt={member.name}
                                                    className="member-image"/>
                                                <p className="text-secd dark:text-drks">{member.name}</p>
                                                <h6>{member.designation}</h6>
                                                <p>{member.keyRole}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedYear === "Other Stuffs" &&
                                    otherStuffsArray.map((action, index) => (
                                        <div key={index}
                                            className="nirf-action-button bg-secd dark:bg-drks hover:bg-accn hover:text-prim dark:hover:bg-drka"
                                            onClick={() => openPdf("Other Stuffs", action.year)}>
                                            {action.year}
                                        </div>
                                    ))}
                            </div>
                        )}

                        {selectedAction && (
                            <div className="nirf-pdf-container">
                                <h3>{`Viewing: ${selectedAction.year}`}</h3>
                                <embed
                                    className="embed"
                                    src={
                                        selectedAction.category === "Certificate"
                                            ? certificateArray.find((item) => item.year === selectedAction.year)?.path
                                            : selectedAction.category === "Events Organized"
                                                ? eventsOrganizedArray.find((item) => item.year === selectedAction.year)?.path
                                                : selectedAction.category === "Policy"
                                                    ? policyArray.find((item) => item.year === selectedAction.year)?.path
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
                ) : (
                <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
                )}
            </>
    );}

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
            <div className="nirf-page">
            <Banner toggle={toggle} theme={theme}
                backgroundImage="./Banners/IIC.webp"            
                headerText="IIC"
                    subHeaderText="Instituition's Innovation Council"
            />

            {isLoading ? (
                <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
            ) : (
                <SideNav sts={iic} setSts={setIic} navData={navData} />
            )}
            
        </div>
    )
}

export default Iic