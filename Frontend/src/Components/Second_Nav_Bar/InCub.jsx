import Banner from "../Banner"
import Msme from '../Assets/msme.png'
import Ltr from '../Assets/MsmeLtr.png'
import Clge from '../Assets/college.jpeg'
import {ChevronRightIcon, Square2StackIcon} from "@heroicons/react/24/solid";
import Slider from "react-slick";
import React, {useEffect, useState} from "react";

const InCub = ({toggle, theme}) => {
    const tiles = [{
        hdr: "Vision", cls: "basis-4/5 lg:basis-2/5",
        cnt: "\"To cultivate a dynamic ecosystem that empowers students, faculty, and entrepreneurs to transform groundbreaking ideas into scalable technologies, fostering the next generation of engineers, leaders, and innovators who drive global change.\""
    }, {
        hdr: "Mission", cls: "basis-4/5 lg:basis-2/5",
        cnt: "\"Our mission is to provide a collaborative and resource-rich environment that supports the development of innovative solutions through research, entrepreneurship, and hands-on experience. We strive to nurture engineering talent by offering mentorship, state-of-the-art facilities, and strategic partnerships, while creating impactful, sustainable ventures that address real-world challenges.\""
    }, {
        hdr: "Objectives", cls: "basis-[81%]",
        cnt: "To Provide resources and mentorship to help students and faculty develop creative solutions and research projects. \nHelp students turn their ideas into startups by offering funding, mentorship, and networking opportunities. \nBuild partnerships with industries for internships, projects, and real-world exposure. \nSupport startups focused on solving social, environmental, and sustainability challenges. \nOffer training, workshops, and networking events to build technical, business, and career skills for students."
    }]
    const cmtie = [
        {pos: "President", cls: "basis-2/5", nme: "John Doe"},
        {pos: "Vice-President", cls: "basis-2/5", nme: "John Doe"},
        {pos: 'Convener', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Industry Expert', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'IPR Expert', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Alumni Expert', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Secretary', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Treasurer', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Event Coordinator', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Marketing & Outreach Coordinator', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Innovation Lab Manager', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Startup Liaison Officer', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Industry Relation Manager', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Research & Development Coordinator', cls: "basis-1/4", nme: "John Doe"},
        {pos: 'Committee Members', cls: "basis-1/4", nme: "John Doe"},
    ]
    const msme = [{
        hdr: "Objective of the Scheme", cls: "",
        cnt: "The objective of the scheme is to promote and support untapped creativity and to promote adoption of latest technologies in MSMEs that seek the validation of their ideas at the proof-of-concept level. The scheme also supports engagement with enablers who will advise such MSMEs in expanding the business by supporting them in design, strategy and execution."
    }, {
        hdr: "Activities", cls: "",
        cnt: "Recognition  of  eligible  institutions  as  Host  Institute  (HI)  to  act  as  Business Incubator (BI)\nApproval of Ideas of Incubatees submitted through Host Institute (HI)\nAssistance for nurturing of Ideas to HI\nAssistance towards Capital Support to HI for Plant and Machinery"
    }, {
        hdr: "Eligibility Criteria: Registration as Host Institute (HI)", cls: "",
        cnt: "Institutions such as Technical Colleges, Universities, other Professional Colleges/Institutes, R&D Institutes, NGOs involved in incubation activities, MSME-DIs/ Technology Centres or any  Institute/Organization  of  Central/State  Government  may  apply  for  registration  as  an  HI and  act  as  a  Business  Incubator (BI) for nurturing of ideas from the initial stage of conceptualization  to  the  commercialization  stage  through  HIs/  BIs.  The  institutions  may apply    for    registration    as    HI    through    the    MIS    portal    of    the DC MSME website, (innovative.msme.gov.in). All earlier approved Host Institutes (HIs) will be continued as HI for scheme implementation."
    }, {
        hdr: "Financial Assistance under the Scheme", cls: "",
        cnt: "Up to maximum of Rs. 15 lakh per idea shall be provided to HI for developing and nurturing the ideas. \nUp  to  Rs.  1.00  cr.  (max)  shall  be  provided  to  HI  for  procurement  and installation of relevant plant and machines including hardware and software etc. in BI for R&D activities and common facilities for incubatees of BI"
    }]
    const slideData = [
        {title: "INCUBATION CENTER (VELAMMAL INCUBATION)", dscrp: "Another Room", image: "./img.png"},
        {title: "PRE-INCUBATION (NEW GEN IEDC)", dscrp: "Another Room", image: "./img.png"},
        {title: "MAKERS LAB", dscrp: "Another Room", image: "./img.png"},
        {title: "IPR CELL", dscrp: "Another Room", image: "./img.png"},
        {title: "IDEA & INNOVATION CELL", dscrp: "Another Room", image: "./img.png"},
        {title: "STARTUP CELL", dscrp: "Another Room", image: "./img.png"},
        {title: "DESIGN CENTRE", dscrp: "Another Room", image: "./img.png"},
        {title: "TINKERING LAB", dscrp: "Another Room", image: "./img.png"},
        {title: "ENTREPRENEURSHIP CELL", dscrp: "Another Room", image: "./img.png"},
    ];
    const flow = [
        "Application Submission", "Idea Screening & Evaluation", "Selection for Incubation",
        "Onboarding & Orientation", "Product Development & Research Support",
        "Business Model & Market Strategy", "Funding & Investment Support", "Legal and Administrative Support",
        "Prototyping & Testing", "Marketing & Networking", "Growth & Scaling Support"
    ]
    const stat = [
        {ttl: "Startups", val: 13},
        {ttl: "Patents", val: 37},
        {ttl: "Mentors", val: 20},
    ]
    const strt = [
        {dep: 'ECE', nme: 'Swap Inc LLP', lic: 'LLP-AAZ-3585', yer: '2021-2022'},
        {dep: 'EEE', nme: 'Inblue Infotech(OPC)Private Limted', lic: 'U72900TN2022OPC156531', yer: '2022-2023'},
        {dep: 'EEE', nme: 'Roshan Refractory', lic: 'UDYAM-TN-24-0077492', yer: '2022-2023'},
        {dep: 'CSE', nme: 'Critter Graphix', lic: 'U62099TN2024OPC166488', yer: '2023-2024'},
        {dep: 'CSE', nme: 'One Host Private Ltd', lic: 'U72900TN2017PTC115116', yer: '2023-2024'},
        {dep: 'CSE', nme: 'Arcsys Labs Private Limited', lic: 'U62013TN2023PTC165847', yer: '2022-2023'},
        {dep: 'CSE', nme: 'Hyperlynx Infotech', lic: 'UDYAM-TN-02-0343894', yer: '2021-2022'},
        {dep: 'CSE', nme: 'Emsensing Technologies Private Limited', lic: 'DIPP102706', yer: '2021-2022'},
        {dep: 'CSE', nme: 'Amply Innovations Private Limited', lic: 'DIPP163912', yer: '2023-2024'},
        {dep: 'MECH', nme: 'Cogniacc Energy Solutions Private Limited', lic: 'U35105TN2023PTC166275', yer: '2022-2023'},
        {dep: 'MECH', nme: 'SSR Engineering Solutions', lic: '33OLUPS1657C1ZI', yer: '2023-2024'},
        {dep: 'MECH', nme: 'Naaz Engineering Works', lic: 'AGOPE1783C', yer: '2022-2023'},
        {dep: 'MECH', nme: 'Naveen & Co', lic: '33BYWPN24321ZH', yer: '2021-2022'},
        {dep: 'MECH', nme: '12 OX Enterprises', lic: '33AGOPE1783C1ZO', yer: '2022-2023'},
        {dep: 'MECH', nme: 'ONYX', lic: '33ASHPJ6368F1ZO', yer: '2023-2024'},
        {dep: 'AUTO', nme: 'Ilakkanam Private Limited', lic: 'U29308TN2022PTC150501', yer: '2021-2022'},
        {dep: 'AUTO', nme: 'VBIND innovation Private Limited', lic: 'U73100TN2021PTC146111', yer: '2021-2022'},
        {dep: 'AUTO', nme: 'Dharshan Brothers Technologies Pvt. Ltd.,', lic: 'U27504TN2023PTC159850', yer: '2023-2024'},
        {dep: 'AUTO', nme: 'PP-VAC Engineering', lic: 'U27900TN2023PTC163627', yer: '2022-2023'},
        {dep: 'MECH', nme: 'Zedtribe Private Limited', lic: 'DIPP87880', yer: '2021-2022'},
        {dep: 'IT', nme: 'Thirumurugan Woodworks', lic: 'UDYAM-TN-12-0135000', yer: '2023-2024'},
        {dep: 'IT', nme: 'Jayasree Chemical Pvt Ltd', lic: 'U24100TN2020PTC138147', yer: '2022-2023'},
        {dep: 'IT', nme: 'Madras Goli Soda', lic: 'UAM NO. TN24A0051924', yer: '2021-2022'},
        {dep: 'EIE', nme: 'Atlanwa', lic: '33DTFPP0740D1Z3', yer: '2022-2023'}
    ]
    const seed = [
        {cpy: "EMSENSING TECHNOLOGIES PRIVATE LIMITED", sed: [
            {fnd: "14,50,000", nme: "MSME", yer: "2023-2024"},
            {fnd: "10,00,000", nme: "TBI – Startup India Seed fund (SISFS) Scheme", yer: "2022-2023"},
            {fnd: "10,10,000", nme: "EDII-Innovation Voucher Programme (IVP)", yer: "2022-2023"},
            {fnd: "6,00,000 ", nme: "Meity TIDE 2.0 ", yer: "2022-2023"},
        ]}
    ]

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    // Auto-slide functionality
    useEffect(() => {
        if (isAutoPlay) {
            const interval = setInterval(() => {
                nextSlide();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [currentIndex, isAutoPlay]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slideData.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slideData.length - 1 ? 0 : prev + 1));
    };

    function parse(cnt) {
        let lis = []
        cnt.split("\n").map((mxt) => {
            const cxt = mxt.split("\"")
            lis.push(cxt)
        })

        return (
            <ul className={(lis.length === 1) ? "list-none pl-0" : "list-disc marker:text-accn dark:marker:text-drks"}>
                {lis.map((ite, ix) => (
                    <li>
                        {ite.map((itm, i) => ((itm !== null && itm !== "") ?
                                <span key={i} className={(i % 2 !== 0 ? 'italic' : '')}>{itm}</span> : ""
                        ))}
                    </li>
                ))}
            </ul>
        )
    }

    function crt_del(num) {
        return `${num * 100}ms`
    }

    return (
        <>
            <Banner toggle={toggle} theme={theme}
                    backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                    headerText="Incubation Cell"
                    subHeaderText="Fostering Innovation and Entrepreneurship"
            />
            <div className="mt-4 mb-24 grid gap-8">
                <div className="flex flex-wrap gap-x-4 gap-y-4 justify-center">
                    {tiles.map((tile, index) => (
                        <div className={`${tile.cls} border-l-8 p-4 border-secd dark:border-drks rounded-xl 
                            bg-[color-mix(in_srgb,theme(colors.secd)_10%,white)] hover:scale-105 
                            dark:bg-[color-mix(in_srgb,theme(colors.drks)_10%,black)]
                            transition-transform duration-200 ease-in`}>
                            <p className="text-3xl mb-2 text-text dark:text-drks">{tile.hdr}</p>
                            <p>{parse(tile.cnt)}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap">
                    <div className="grid grid-cols-1 group gap-6 px-12 lg:px-32 justify-center w-fit
                        lg:basis-1/2 lg:ml-12">
                        <p className="text-3xl -ml-8 lg:ml-0">Incubation Process</p>
                        {flow.map((flw, ind) => (
                            <div className={`text-xl text-center rounded-xl w-max lg:w-fit max-w-[90vw] justify-self-center py-1 px-4
                            bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)]
                            border-l-4 border-text dark:border-drka group-hover:border-secd dark:group-hover:border-drks
                            dark:bg-[color-mix(in_srgb,theme(colors.drks)_10%,black)] relative`}
                                 style={{transitionDelay: `${ind * 100}ms`}}>
                            <span className={`absolute border-x-2 border-text dark:border-drka 
                                ${(ind === flow.length - 1) ? 'hidden' : 'block'} -bottom-6 left-1/2 w-2 h-6
                                group-hover:border-secd dark:group-hover:border-drks transition-colors duration-300 ease`}
                                  style={{transitionDelay: `${ind * 100}ms`}}/>
                                {flw}</div>
                        ))}
                    </div>
                    <div className={`bg-cover bg-no-repeat mt-12 lg:ml-24`}
                         style={{backgroundImage: `url(${Clge})`}}>
                        <div className="grid grid-cols-2 gap-24 p-16 place-content-center
                            backdrop-blur-xl bg-prim/30
                            size-full text-text font-bold bg-[position:200px_0]">
                            {stat.map((sta, ind) => (
                                <div key={ind}>
                                    <p className="text-2xl animate-[fadIn_2s_ease-in_forwards]">{sta.val}+</p>
                                    <p className="text-lg">{sta.ttl}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center lg:px-0 mt-8">
                    <p className="basis-full text-3xl ml-[10vw]">Committee</p>
                    {cmtie.map((cmt, i) => (
                        <div className={`${cmt.cls} py-2 px-4 rounded-xl hover:border-l-4 border-secd dark:border-drka
                            bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                            transition-colors duration-300 ease-in`}>
                            <p className="text-xl">{cmt.nme}</p>
                            <p className="text-lg text-accn dark:text-drka">{cmt.pos}</p>
                        </div>
                    ))}
                </div>
                <div className="justify-center lg:mx-32 p-4 rounded-xl
                    bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                    dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
                    <img src={Msme} alt="MSME" className="w-1/5 h-auto mr-4 hidden md:inline dark:invert"/>
                    <span className="text-4xl">MSME (MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES)</span>
                    <div className={"h-4"}/>
                    {msme.map((msm, i) => (
                        <div className={`${msm.cls}`}>
                            <p className="text-2xl text-accn dark:text-drka">{msm.hdr}</p>
                            <p className="text-md">{parse(msm.cnt)}</p>
                        </div>
                    ))}
                    {/*<button className="rounded-t-xl bg-secd hover:bg-accn hover:text-prim px-4 py-2*/}
                    {/*    dark:bg-drks dark:hover:bg-drka"*/}
                    {/*        onClick={(e) => e.target.nextElementSibling.classList.toggle("hidden")}>*/}
                    {/*    <ChevronRightIcon className='size-[1.5vmax] inline' />*/}
                    {/*    Approved Letter from MSME</button>*/}
                    <input id="appr" className="peer hidden" type={"checkbox"}/>
                    <label htmlFor="appr" className="rounded-t-xl bg-secd hover:bg-accn hover:text-prim px-4 py-2
                        peer-checked:bg-accn peer-checked:text-prim dark:peer-checked:bg-drks peer-checked:*:rotate-90
                        dark:bg-drks dark:hover:bg-drka transition-all duration-300 ease-in">
                        <ChevronRightIcon className='size-[1.5vmax] inline transition-all duration-200 ease-in-out'/>
                        Approved Letter from MSME
                    </label>
                    <img className="bg-accn dark:bg-drks w-1/2 h-0 rounded-r-xl rounded-bl-xl
                        peer-checked:h-auto peer-checked:p-1
                        transition-all duration-200 ease-in"
                         src={Ltr} alt={"Msme Approval Letter"}/>
                </div>
                <div className="nss-carousel-wrap h-fit">
                    <div className="nss-carousel-container" style={{transform: `translateX(-${currentIndex * 100}%)`}}>
                        {slideData.map((slide, index) => (
                            <div className="nss-carousel-slide" key={index}>
                                <img src={slide.image} alt={slide.title}/>
                                <div className="nss-carousel-texty bottom-0 lg:bottom-24 lg:mb-4 lg:px-8">
                                    <h3 className="text-sm lg:text-2xl lg:mb-4">{slide.title}</h3>
                                    <p className="text-xs lg:text-xl">{slide.dscrp}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <button className="nss-carousel-btn nss-carousel-btn-left" onClick={prevSlide}>&#10094;</button>
                    <button className="nss-carousel-btn nss-carousel-btn-right" onClick={nextSlide}>&#10095;</button>

                    {/* Dots Indicator */}
                    <div className="nss-carousel-dots">
                        {slideData.map((_, index) => (
                            <span
                                key={index}
                                className={`nss-dot ${index === currentIndex ? "bg-secd dark:bg-drks" : "bg-gray-500"}`}
                                onClick={() => setCurrentIndex(index)}
                            ></span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center lg:mx-32 px-4">
                    <p className="basis-full text-3xl">Our StartUps</p>
                    {strt.map((srt, ind) => (
                        <div className="basis-1/5 p-4 rounded-2xl bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)]
                            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] grow
                            hover:scale-105 transition-transform ease-in" key={ind}>
                            <p className="text-2xl text-accn dark:text-drks mb-2">{srt.nme}</p>
                            <p className="font-semibold">{srt.dep} | {srt.yer}</p>
                            <p className="cursor-pointer"
                               onClick={() => {
                                   navigator.clipboard.writeText(srt.lic)
                               }}>{srt.lic}
                                <Square2StackIcon
                                    className='size-[1.5vmax] text-accn dark:text-drks ml-1 mb-1
                                    inline transition-all duration-200 ease-in-out'/></p>
                        </div>
                    ))}
                </div>
                <div className="relative overflow-x-auto lg:mx-32">
                    <p className="text-3xl my-4">SEED MONEY RECEIVED FROM OTHER INCUBATION </p>
                    <table className="w-full text-sm text-left rounded-xl">
                        <thead
                            className="text-xs uppercase bg-[color-mix(in_srgb,theme(colors.prim)_65%,black)]
                            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_65%,black)]">
                            <tr>
                                <th scope="col" className="px-6 py-3 max-w-[100px]">
                                    Name of Start Up
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Seed funding received (in Rupees)
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Name of Government Organization providing Seed Funding
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Year of Receiving the Fund
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                        {seed.map((cmp, ind) => (
                            <>
                                {cmp.sed.map((org, ind) => (
                                    <tr className="even:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                                            dark:even:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]
                                            border-b dark:border-drka border-prim"
                                        key={ind}>
                                        {(ind < 1) ?
                                            <th scope="row" rowSpan={cmp.sed.length}
                                                className="px-6 py-4 text-xl font-medium text-gray-900
                                                 dark:text-white">
                                                {cmp.cpy}
                                            </th> : ""}
                                        <td className="px-6 py-4">
                                            {org.fnd}
                                        </td>
                                        <td className="px-6 py-4">
                                            {org.nme}
                                        </td>
                                        <td className="px-6 py-4">
                                            {org.yer}
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="lg:mx-32">
                    <p className="text-3xl mb-4">Connect with us</p>
                    <p className="py-2 px-8 rounded-xl text-xl bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] w-fit">
                        <a href="mailto:Incubation@velammal.edu.in">Incubation@velammal.edu.in
                    </a></p>
                </div>
            </div>
        </>
    )
}

export default InCub

