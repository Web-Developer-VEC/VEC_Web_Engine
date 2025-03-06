import React from 'react';
import axios from "axios";
import { 
    BookText, Award, Briefcase, GraduationCap, Users, Linkedin, Github, 
    Book, ArrowRight, X, Lightbulb, 
    ChevronRight, ChevronLeft, 
    Handshake, 
  } from 'lucide-react';  
import { useEffect, useRef, useState } from 'react';
import { SiPublons } from "react-icons/si";
import { FaEnvelope, FaGoogleScholar, FaLinkedin, FaOrcid, FaPhone, FaResearchgate } from "react-icons/fa6";
import { GoProjectRoadmap } from "react-icons/go";
import { MdCoPresent } from "react-icons/md";
import '../sections/Facultyprofile.css'
import { useParams } from 'react-router-dom';
import Sun from "../../../Assets/sun.png";
import Moon from "../../../Assets/moon.png";


  
const StatCard = ({ number, title, icon: Icon }) => (
  <div className="faculty-stat-card">
    <div className="faculty-stat-content">
      {/* <div className="faculty-stat-icon">
        <Icon />
      </div> */}
      <span className="faculty-stat-number">{number}</span>
      <p className="faculty-stat-title">{title}</p>
    </div>
  </div>
);

const SocialIcon = ({ icon: Icon, label, bgColor, url }) => (
  <a 
    href={url} 
    className={`faculty-social-icon ${bgColor} bg-secd dark:bg-drks text-text dark:text-drkt`}
    title={label} 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <Icon />
  </a>
);

const ProfileSection = ({data}) => {
  const getNumber = (value) => value ? Number(value) : 0;

  const stats = [
    {
      number: getNumber(data?.Journal_Publications) + getNumber(data?.Conference_Publications),
      title: 'Publications',
      icon: BookText,
      bgColor: 'faculty-bg-cyan'
    },
    {
      number: getNumber(data?.Sponsored_Projects),
      title: 'Sponsored Projects',
      icon: Award,
      bgColor: 'faculty-bg-lime'
    },
    {
      number: getNumber(data?.Patent_Filed) + getNumber(data?.Patent_Published) + getNumber(data?.Patent_Granted),
      title: 'Patents (Filed, Published, Granted)',
      icon: Briefcase,
      bgColor: 'faculty-bg-purple'
    },
    {
      number: getNumber(data?.PHD_Produced) + getNumber(data?.PHD_Pursuing),
      title: 'M.E./Ph.D. Scholars',
      icon: GraduationCap,
      bgColor: 'faculty-bg-orange'
    },
    {
      number: getNumber(data?.Guest_Lectures_Attended),
      title: 'Guest Lectures Attended',
      icon: Users,
      bgColor: 'faculty-bg-emerald'
    }
  ];

  const getValidUrl = (url) => url ? url : null;

  const social = [
    { 
      icon: SiPublons, 
      label: 'Publon', 
      bgColor: 'faculty-bg-publons', 
      url: getValidUrl(data?.Publon_Profile)
    },
    { 
      icon: FaGoogleScholar, 
      label: 'Google Scholar', 
      bgColor: 'faculty-bg-google-scholar', 
      url: getValidUrl(data?.Google_Scholar_Profile)
    },
    { 
      icon: FaOrcid, 
      label: 'Orcid', 
      bgColor: 'faculty-bg-orcid', 
      url: getValidUrl(data?.Orchid_Profile)
    },
    { 
      icon: FaResearchgate, 
      label: 'Research Gate', 
      bgColor: 'faculty-bg-research', 
      url: getValidUrl(data?.Research_Gate)
    },
    { 
      icon: FaLinkedin, 
      label: 'LinkedIn', 
      bgColor: 'faculty-bg-linkedin', 
      url: getValidUrl(data?.LinkedIn_Profile)
    },
    { 
      icon: FaOrcid, 
      label: 'Scopus', 
      bgColor: 'faculty-bg-scopus', 
      url: getValidUrl(data?.Scopus_Author_Profile)
    }
  ];
  
  const socials = social.filter(item => item.url !== null);

  return (
    <div className="faculty-profile-container">
      <div className="faculty-profile-card">
        <div className="faculty-profile-content">
          {/* Left Column - Photo and Social Icons */}
          <div className="faculty-profile-left">
            {/* Photo */}
            <div className="faculty-profile-photo border-4 border-secd dark:border-drks rounded-lg
              [box-shadow:0_4px_15px_theme(colors.secd)] dark:[box-shadow:0_4px_15px_theme(colors.drks)]">
              <img 
                src={data?.Photo} 
                alt="Profile" 
              />
            </div>
            
            {/* Social Icons */}
            <div className="faculty-social-icons">
            {socials
              .filter(social => social.url) // Remove icons without a valid URL
              .map((social, index) => (
                <SocialIcon key={index} {...social} />
              ))}
          </div>
          </div>
          
          {/* Right Column - Name, Designation, and Stats */}
          <div className="faculty-profile-right">
            <div className="faculty-profile-info">
              <div className='faculty-profile-information'>
                <h1 className="faculty-profile-name">{data?.Surname} {data?.Name}</h1>
                <h3 className="faculty-profile-qualification">{data?.Degree}</h3>
                <p className="faculty-profile-designation">{data?.Designation}</p>
                <p className="faculty-profile-designation">Department Of {data?.Department_Name}</p>
              </div>
              <div className='faculty-profile-contact'>
                <p className='fac-contact'> <FaPhone style={{ marginRight: "8px" }} />Phone: +91 152463987</p>
                <p className='fac-contact'> <FaEnvelope style={{ marginRight: "8px" }} />Email: madara@gmail.com</p>
              </div>
              
            </div>
            {/* Stats Grid */}
            <div className="faculty-stats-grid">
            <div className="faculty-stats-grid">
              {stats
                .filter(stat => stat.number) // Filter out invalid stats
                .map((stat, index) => (
                  <div key={index} className={`faculty-stat-wrapper ${stat.bgColor}`}>
                    <StatCard {...stat} />
                  </div>
                ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EducationTimeline = ({ data }) => {

  const educationalQualifications = (data?.EDUCATIONAL_QUALIFICATION || [])
  .filter((item) => 
    item.DEGREE && 
    item.BRANCH && 
    item.INSTITUTE && 
    item.YEAR
  );

  const [visibleCards, setVisibleCards] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const cardsRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoScrollIntervalRef = useRef(null);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const showCards = () => {
      educationalQualifications.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 300);
      });
    };
    showCards();
  }, [educationalQualifications]);

  useEffect(() => {
    const calculateMaxScroll = () => {
      if (cardsRef.current) {
        const container = cardsRef.current;
        const containerWidth = container.parentElement.offsetWidth;
        const scrollWidth = container.scrollWidth;
        setMaxScroll(Math.max(scrollWidth - containerWidth, 0));
      }
    };

    calculateMaxScroll();
    window.addEventListener('resize', calculateMaxScroll);
    return () => window.removeEventListener('resize', calculateMaxScroll);
  }, []);

  useEffect(() => {
    if (reachedEnd) {
      const resetTimeout = setTimeout(() => {
        setScrollPosition(0);
        setReachedEnd(false);
        if (cardsRef.current) {
          cardsRef.current.style.transition = 'transform 0.6s ease-out';
          cardsRef.current.style.transform = `translateX(0)`;
        }
      }, 700);
      return () => clearTimeout(resetTimeout);
    }

    const startAutoScroll = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }

      autoScrollIntervalRef.current = setInterval(() => {
        if (!isPaused && !reachedEnd) {
          handleScroll('right');
        }
      }, 800);
    };

    startAutoScroll();
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isPaused, reachedEnd, maxScroll]);

  const handleScroll = (direction) => {
    if (isAnimating || !cardsRef.current) return;
    setIsAnimating(true);

    const container = cardsRef.current;
    const cardElement = container.querySelector('.faculty-card-wrapper');
    if (!cardElement) return;

    const cardWidth = cardElement.offsetWidth + 64;
    const currentPosition = scrollPosition;
    
    let newPosition;
    if (direction === 'left') {
      newPosition = Math.max(currentPosition - cardWidth, 0);
    } else {
      newPosition = Math.min(currentPosition + cardWidth, maxScroll);
      if (newPosition >= maxScroll) {
        setReachedEnd(true);
      }
    }

    container.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    container.style.transform = `translateX(-${newPosition}px)`;
    setScrollPosition(newPosition);

    setTimeout(() => {
      setIsAnimating(false);
      container.style.transition = '';
    }, 600);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      handleScroll(diff > 0 ? 'right' : 'left');
    }
  };

  return (
    <div 
      className="faculty-timeline-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <h2 className="faculty-timeline-title">
        <GraduationCap className="faculty-title-icon"/>
        Education Qualification
      </h2>

      <div className="faculty-scroll-progress-container">
        <div 
          className="faculty-scroll-progress-bar" 
          style={{ width: `${(scrollPosition / maxScroll) * 100}%` }}
        />
      </div>

      <button
        className="faculty-scroll-button faculty-left"
        onClick={() => handleScroll('left')}
        disabled={isAnimating || scrollPosition === 0}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="faculty-timeline-cards-container">
        <div className="faculty-timeline-cards" ref={cardsRef}>
          {educationalQualifications?.map((education, index) => (
            <div
              key={index}
              className={`faculty-card-wrapper ${visibleCards.includes(index) ? 'faculty-visible' : ''}`}
              style={{ '--index': index }}
            >
              {index < educationalQualifications.length - 1 && (
                <div className="faculty-connection-line">
                  <div className={`faculty-line ${visibleCards.includes(index + 1) ? 'faculty-active' : ''}`} />
                  <ChevronRight 
                    className={`faculty-arrow-icon ${visibleCards.includes(index + 1) ? 'faculty-active' : ''}`}
                  />
                </div>
              )}

              <div className="faculty-education-card bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]">
                <div className="faculty-card-header">
                  <h3 className="text-secd dark:text-drks">{education.DEGREE} / {education.BRANCH}</h3>
                </div>
                <div className="faculty-card-content">
                  <div className="faculty-duration-row">
                    <span className="faculty-label">Year</span>
                    <span className="faculty-year">{education.YEAR}</span>
                  </div>
                  <div className="faculty-institution-row">
                    <span className="faculty-label">Institution</span>
                    <p className="faculty-institution">{education.INSTITUTE}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="faculty-scroll-button faculty-right"
        onClick={() => handleScroll('right')}
        disabled={isAnimating || scrollPosition >= maxScroll}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};


const Experience = ({data}) => {
  const roadmapRef = useRef(null);
  const [hasReachedStart, setHasReachedStart] = useState(true);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const autoScrollTimeoutRef = useRef(null);

  const experiences = (data?.EXPERIENCE || [])
  .filter((item) => 
    item.From && 
    item.TO && 
    item.YEARS && 
    item.MONTHS && 
    item.DESIGNATION && 
    item.INSTITUTION
  );

  useEffect(() => {
    if (roadmapRef.current) {
      roadmapRef.current.scrollTo({ left: roadmapRef.current.scrollWidth, behavior: "smooth" });

      autoScrollTimeoutRef.current = setTimeout(() => {
        roadmapRef.current.scrollTo({ left: roadmapRef.current.scrollWidth, behavior: "smooth" });

        setTimeout(() => {
          setIsSettled(true);
        }, 700);
      }, 800);
    }

    return () => clearTimeout(autoScrollTimeoutRef.current);
  }, []);

  useEffect(() => {
    const checkScrollPosition = () => {
      if (roadmapRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = roadmapRef.current;
        setHasReachedStart(scrollLeft <= 5);
        setHasReachedEnd(scrollLeft + clientWidth >= scrollWidth - 5);
      }
    };

    if (roadmapRef.current) {
      roadmapRef.current.addEventListener("scroll", checkScrollPosition);
    }

    return () => {
      if (roadmapRef.current) {
        roadmapRef.current.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, []);

  const handleScroll = (direction) => {
    if (roadmapRef.current) {
      const scrollAmount = 300;
      roadmapRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  return (
      <div className="faculty-experience-container">
        <div className='faculty-experience-head-container'>
          <h2 className="faculty-experience-header">
            <Handshake className="faculty-title-icon"/>
            Experience</h2>
        </div>
        <div className="faculty-roadmap-wrapper">
          <button
            className={`faculty-scroll-button faculty-left ${!isSettled || hasReachedStart ? "faculty-disabled" : ""}`}
            onClick={() => handleScroll("left")}
            disabled={!isSettled || hasReachedStart}
          >
            &#8592;
          </button>

          <div
            className="faculty-roadmap-container"
            ref={roadmapRef}
          >
            <div className="faculty-roadmap">
              {/* Horizontal Line Below Titles */}
              <div className="faculty-roadmap-line"></div>

              {experiences.map((item, index) => (
                <div className="faculty-roadmap-item" key={index}>
                  <div className="faculty-roadmap-title">{item.INSTITUTION}</div>
                  <div className="faculty-roadmap-popup">
                    <p><strong>Duration: {item.YEARS} years {item.MONTHS} months</strong></p>
                    <p>From: {item.From}</p>
                    <p>To: {item.TO}</p>
                    <p><strong>Designation:</strong> {item.DESIGNATION}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`faculty-scroll-button faculty-right ${!isSettled || hasReachedEnd ? "faculty-disabled" : ""}`}
            onClick={() => handleScroll("right")}
            disabled={!isSettled || hasReachedEnd}
          >
            &#8594;
          </button>
        </div>
      </div>
  );
};



const Modal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (typeof e.target.className === "string" && e.target.className.includes("faculty-modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="faculty-modal-overlay" onClick={handleBackgroundClick}>
      <div className="faculty-modal-card">
        <button className="faculty-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="faculty-modal-content">
          {content ? (
            <>
              <h2>{content.text}</h2>
              {Object.entries(content.details).map(([key, value], index) => (
                <p key={index}>
                  <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                  {typeof value === "string" && value.startsWith("http") ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="faculty-tilesa-pp-item-link">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </p>
              ))}
            </>
          ) : (
            <p>No content available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Tile = ({ title, icon, items, onItemClick }) => {
  const [expanded, setExpanded] = useState(false);

  const handleViewMore = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const visibleItems = expanded ? items : items.slice(0, 5);

  return (
    <div className="faculty-tiles-app-tile bg-[color-mix(in_srgb,theme(colors.prim)_95%,black)]
      dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] border-2 border-secd dark:border-drks">
      <div className="faculty-tiles-app-tile-header">
        <div className="faculty-tiles-app-tile-icon">{icon}</div>
        <h2 className="faculty-tiles-app-tile-title text-text dark:text-drkt">{title}</h2>
      </div>
      <ul className="faculty-tiles-app-tile-list">
      {visibleItems
        .filter((item) => item.text && Object.keys(item.details).length > 0) // Ensure text and details exist
        .map((item, index) => (
          <li key={index} className="faculty-tiles-app-tile-item">
            <ArrowRight className="faculty-tiles-app-item-icon text-secd dark:text-drks" />
            <a
              className="faculty-tiles-app-item-link"
              onClick={(e) => {
                e.preventDefault();
                onItemClick(item);
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
    </ul>
      {items.length > 5 && (
        <button className="faculty-tiles-app-view-more bg-secd dark:bg-drks text-text dark:text-drkt
          hover:bg-accn hover:text-prim dark:hover:bg-drka dark:hover:text-prim" onClick={handleViewMore}>
          {expanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
};


const Tiles = ({ data }) => {
  const [tileData, setTileData] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!data) return;

    const tiles = [
      {
        title: "Projects",
        icon: <Lightbulb size={24} />,
        items: data.PROJECTS?.map((item) => {
          const details = {
            "Sponsoring Agency": item["SPONSORING AGENCY"],
            "Amount": item.AMOUNT,
            "Year of Sanction": item["YEAR OF SANCTION"],
            "Duration": item.DURATION,
            "Responsibility": item["RESPONSIBILITY (PI / CO PI)"],
            "Status": item["STATUS ( Completed / Ongoing)"],
          };
    
          const filteredDetails = Object.fromEntries(
            Object.entries(details).filter(([_, value]) => value)
          );
    
          if (!item.TITLE && Object.keys(filteredDetails).length === 0) return null;
    
          return {
            text: item.TITLE || "No Title Available",
            link: item.LINK || "#",
            details: filteredDetails,
          };
        }).filter(Boolean) || [],
      },
      {
        title: "Patents",
        icon: <GoProjectRoadmap size={24} />,
        items: data.PATENTS?.map((item) => {
          const details = {
            "Patent Type": item["PATENT_TYPE_(UTILITY)"],
            "Country": item.COUNTRY,
            "Status": item["STATUS_(_Published_/_FER_/_Granted_)"],
            "Date of Recent Achieved Level": item.DATE_OF_RECENT_ACHIEVED_LEVEL,
          };
    
          const filteredDetails = Object.fromEntries(
            Object.entries(details).filter(([_, value]) => value)
          );
    
          if (!item.NAME_OF_PATENT && Object.keys(filteredDetails).length === 0) return null;
    
          return {
            text: item.NAME_OF_PATENT || "No Title Available",
            link: item.LINK || "#",
            details: filteredDetails,
          };
        }).filter(Boolean) || [],
      },
      {
        title: "Journals",
        icon: <GoProjectRoadmap size={24} />,
        items: data.JOURNAL_PUBLICATIONS?.map((item) => {
          const details = {
            "Authors": item.AUTHORS,
            "Journal Name": item.JOURNAL_NAME,
            "DOI Number": item.DOI_NUMBER,
            "Page No": item.PAGE_NO,
            "Month & Year": item["MONTH_&_YEAR"],
          };
    
          const filteredDetails = Object.fromEntries(
            Object.entries(details).filter(([_, value]) => value)
          );
    
          if (!item.PAPER_TITLE && Object.keys(filteredDetails).length === 0) return null;
    
          return {
            text: item.PAPER_TITLE || "No Title Available",
            link: item.DOI_NUMBER || "#",
            details: filteredDetails,
          };
        }).filter(Boolean) || [],
      },
      {
        title: "Conference",
        icon: <MdCoPresent size={24} />,
        items: data.CONFERENCE_PUBLICATIONS?.map((item) => {
          const details = {
            "Authors": item.AUTHORS,
            "Conference Name": item["CONFERENCE NAME"],
            "Organized By": item["ORGANIZED BY"],
            "ISBN / ISSN / DOI": item["ISBN / ISSN /DOI NO"],
            "Month & Year": item["MONTH_&_YEAR"],
          };
    
          const filteredDetails = Object.fromEntries(
            Object.entries(details).filter(([_, value]) => value)
          );
    
          if (!item.PAPER_TITLE && Object.keys(filteredDetails).length === 0) return null;
    
          return {
            text: item.PAPER_TITLE || "No Title Available",
            link: item.LINK || "#",
            details: filteredDetails,
          };
        }).filter(Boolean) || [],
      },
      {
        title: "Books Published",
        icon: <Book size={24} />,
        items: data.BOOK_PUBLICATIONS?.map((item) => {
          const details = {
            "Author": item.AUTHOR,
            "Publisher": item.PUBLISHER,
            "ISBN / ISSN": item["ISBN / ISSN NO"],
            "Month & Year": item["MONTH_&_YEAR"],
            "Type": item["BOOK / BOOK CHAPTER"],
          };
      
          const filteredDetails = Object.fromEntries(
            Object.entries(details).filter(([_, value]) => value)
          );
      
          if (!item["BOOK_NAME,_EDITION"] && Object.keys(filteredDetails).length === 0) return null;
      
          return {
            text: item["BOOK_NAME,_EDITION"] || "No Title Available",
            link: item.LINK || "#",
            details: filteredDetails,
          };
        }).filter(Boolean) || [],
      },
      {
        title: "Research Scholars",
        icon: <GoProjectRoadmap size={24} />,
        items: data.RESEARCH_SCHOLARS?.map((item) => {
          const details = {
            "Scholar Name": item.RESEARCH_SCHOLAR_NAME,
            "Category": item["CATEGORY__(FULL_TIME_/_PART__TIME)"],
            "Status": item["STATUS_(_ONGOING_/_COMPLETED)"],
            "Degree Awarded": item["MONTH_&_YEAR_OF_DEGREE_AWARDED"],
          };
    
          const filteredDetails = Object.fromEntries(
            Object.entries(details).filter(([_, value]) => value)
          );
    
          if (!item.RESEARCH_TITLE && Object.keys(filteredDetails).length === 0) return null;
    
          return {
            text: item.RESEARCH_TITLE || "No Title Available",
            link: item["PROFILE LINK"] || "#",
            details: filteredDetails,
          };
        }).filter(Boolean) || [],
      },
    ];
    
    // Remove categories that have no items
    const filteredTiles = tiles.filter((tile) => tile.items.length > 0);
    setTileData(filteredTiles);
  }, [data]);

  const openModal = (item) => {
    setModalData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalData(null);
    setIsModalOpen(false);
  };

  return (
    <div className="faculty-tiles-app-container">
      <div className={`faculty-tiles-app-content ${isModalOpen ? "faculty-blurred" : ""}`}>
        <div className="faculty-tiles-app-grid">
          {tileData.map((tile, index) => (
            <Tile key={index} {...tile} onItemClick={openModal} />
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} content={modalData} />
    </div>
  );
};


const Facultyprofile = ({theme, toggle}) => {
  const { uid } = useParams();
  const [facultyData, setProfileData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      try {
        setError(null);
        const response = await axios.get(`/api/staffprofile/${uid}`);   //${uid}
        console.log("Deatils",response.data);
        
        setProfileData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to fetch data.");
        setLoading(true)
      }
    };
    
    fetchData();
  }, [uid]);
  
    return(
        <div>
          <div className='absolute flex gap-2 float-right mt-4 lg:-mt-1 size-12 px-2 py-2 z-[50]
            bg-prim dark:bg-drkp w-48 -right-10 rounded-bl-xl'>
            <img className="h-8 w-auto p-1 grayscale-0 dark:grayscale" src={Sun} alt="Dark"/>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" onChange={toggle}
                     checked={(theme !== "light")}/>
              <div className="relative h-6 w-12 bg-gray-200 rounded-full peer
              dark:bg-gray-700 peer-checked:after:translate-x-full
              rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white
              after:content-[''] after:absolute after:top-0.5 after:start-1 after:bg-white
              after:border-gray-300 after:border after:rounded-full after:size-5
              after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
              dark:peer-checked:bg-blue-600"></div>
              {/*<span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Toggle me</span>*/}
            </label>
            <img className="h-8 w-auto p-1.5 grayscale dark:grayscale-0" src={Moon} alt="light"/>
          </div>
          {isLoading && (
              <div className="loading-screen">
                <div className="spinner"></div>
                Loading...
              </div>
          )}
          <ProfileSection data={facultyData}/>
          <EducationTimeline data={facultyData}/>
          <Experience data={facultyData}/>
          <Tiles data={facultyData}/>
        </div>
    );
};

export default Facultyprofile;
