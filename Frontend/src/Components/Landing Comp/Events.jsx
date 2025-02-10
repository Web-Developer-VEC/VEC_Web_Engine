import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {animate, motion, useAnimationFrame, useMotionValue, useTransform} from "framer-motion";
import "./Events.css";

function EventBox({event, onMouseEnter, onMouseLeave}) {
    return (
        <motion.div
            className="caro-item text-lg"
            whileHover={{scale: 1.05}}
            transition={{duration: 0.3, ease: "easeOut"}}
            onHoverStart={onMouseEnter}
            onHoverEnd={onMouseLeave}
        >
            <motion.div
                className="event-box"
                whileHover={{boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.15)"}}
            >
                <div className="event-header">
                    <div className="event-date">
                        <div className="circle">{event.start_date}</div>
                    </div>
                    <div className="event-name line-clamp-2 text-2xl">{event.title}</div>
                </div>
                <div className="event-details">
                    <div className="event-row department-name text-xl">{event.department}</div>
                    <div className="event-row description text-sm line-clamp-2">{event.content}</div>
                    <div className="event-footer">
                        <div className="event-row duration">
                            <i className="fas fa-calendar-alt"></i> {event.start_date + " - " + event.end_date}
                        </div>
                        <div className="event-row links">
                            <a href={event.brochure_path} target="_blank" rel="noopener noreferrer">
                                Brochure
                            </a>
                            <a href={event.website_link} target="_blank" rel="noopener noreferrer">
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
            <div className="nav-button-area left">
                <motion.button
                    className="nav-button"
                    onClick={() => x.set(x.get() - CARD_WIDTH)}
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                >
                    <ChevronLeft className="nav-icon"/>
                </motion.button>
            </div>
            <div className="caro-container font-popp">
                <motion.div className="caro-content text-xl" style={{x: wrappedX}}>
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
            <div className="nav-button-area right">
                <motion.button
                    className="nav-button"
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
