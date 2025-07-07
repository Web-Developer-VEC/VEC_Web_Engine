import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {animate, motion, useAnimationFrame, useMotionValue, useTransform} from "framer-motion";
import "./Events.css";

function EventBox({event, onMouseEnter, onMouseLeave}) {

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    return (
        <motion.div
            className="caro-item text-lg"
            whileHover={{scale: 1.1, zIndex: 10}}
            transition={{duration: 0.3, ease: "easeOut"}}
            onHoverStart={onMouseEnter}
            onHoverEnd={onMouseLeave}
        >
            <motion.div
                className="event-box bg-secd dark:bg-drks text-prim"
                whileHover={{boxShadow: "1px 1px 1px rgba(0, 0, 0, 0.15)"}}
            >
                <div className="event-header">
                    <div className="event-date">
                        <div className="circle bg-accn text-prim dark:text-drkt
                            border-8 border-prim dark:border-drkp">{event.start_date}</div>
                    </div>
                    <div className="event-name line-clamp-2 text-2xl">{event.title}</div>
                </div>
                <div className="event-details text-text dark:text-drkt">
                    <div className="event-row department-name bg-prim dark:bg-drkp text-xl">{event.department}</div>
                    <div className="event-row description text-md/2 line-clamp-2">{event.content}</div>
                    <div className="event-footer">
                        <div className="event-row text-accn duration font-semibold">
                            <i className="fas fa-calendar-alt"></i> {event.start_date + " - " + event.end_date}
                        </div>
                        <div className="event-row links">
                            <a href={UrlParser(event.brochure_path)} target="_blank" rel="noopener noreferrer" className="dark:text-drka">
                                Brochure
                            </a>
                            <a href={UrlParser(event.website_link)} target="_blank" rel="noopener noreferrer" className="dark:text-drka">
                                Website
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function Carousel() {
    const x = useMotionValue(0);
    const lastScrollTime = useRef(Date.now());
    const isHovered = useRef(false);
    const [events, setEvents] = useState([]);

    const CARD_WIDTH = 465;
    const SCROLL_SPEED = 3;
    const SCROLL_INTERVAL = 16;

    // Duplicate events to ensure smooth looping
    const duplicatedEvents = [...events, ...events, ...events];
    const TOTAL_WIDTH = duplicatedEvents.length * CARD_WIDTH;

    const wrappedX = useTransform(x, (value) => {
        const range = TOTAL_WIDTH;
        const wrapped = ((value % range) + range) % range;
        return -wrapped;
    });

    // Auto-scrolling logic
    useAnimationFrame(() => {
        if (!isHovered.current) {
            const now = Date.now();
            if (now - lastScrollTime.current >= SCROLL_INTERVAL) {
                const currentX = x.get();
                const newX = currentX + SCROLL_SPEED;

                // Reset the position seamlessly
                if (newX >= TOTAL_WIDTH / 3) {
                    x.set(0);
                } else {
                    x.set(newX);
                }

                lastScrollTime.current = now;
            }
        }
    });

    const handleHoverStart = () => {
        isHovered.current = true;
    };

    const handleHoverEnd = () => {
        isHovered.current = false;
    };

    // Fetch events
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/events`);
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching data:", error.message);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="event-carousel-wrapper">
            <div className="nav-button-area-ann z-[500] left">
                <motion.button
                    className="nav-button-ann"
                    onClick={() => x.set(x.get() - CARD_WIDTH)}
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                >
                    <ChevronLeft className="nav-icon"/>
                </motion.button>
            </div>
            <div className="caro-container font-popp">
                <motion.div className="caro-content md:gap-8 text-xl" style={{x: wrappedX}}>
                    {duplicatedEvents.map((event, index) => (
                        <div draggable={true} onClick={handleHoverStart} onMouseLeave={handleHoverEnd} key={index}>
                            <EventBox
                                event={event}
                                onMouseEnter={handleHoverStart}
                                onMouseLeave={handleHoverEnd}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
            <div className="nav-button-area-ann right">
                <motion.button
                    className="nav-button-ann"
                    onClick={() => x.set(x.get() + CARD_WIDTH)}
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                >
                    <ChevronRight className="nav-icon"/>
                </motion.button>
            </div>
        </div>
    );
}

export default Carousel;
