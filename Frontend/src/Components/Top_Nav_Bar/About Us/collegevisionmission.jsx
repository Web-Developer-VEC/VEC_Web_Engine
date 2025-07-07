import React, { useEffect, useState } from "react";
import styles from "./collegevisionmission.module.css";
import { Eye, Target } from "lucide-react"; // Importing icons
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const Collegevisionmission = ({ theme, toggle }) => {

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

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    return (
        <div className={styles.root}>
            <Banner
                toggle={toggle}
                theme={theme}
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                headerText="Vision & Mission"
                subHeaderText="Empowering a better tomorrow through innovation and integrity"
            />
            <div className={styles.visionMissionContainer}>
                {/* Vision Section (Left) and Photo (Rightmost) */}
                <div className={styles.visionWrapper}>
                    <div className={`${styles.visionCard} ${styles.card} bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks`}>
                        <div className={styles.cardHeader}>
                            {/* <Eye size={24} className="text-white me-2" /> */}
                            <h2 className={`${styles.cardTitle} text-brwn dark:text-prim border-b-2 border-secd dark:border-drks pb-1`}>Institute Vision</h2>
                        </div>
                        <p className={styles.cardContent}>
                            To educate the student community both by theory and practice to fit in with society and to conquer tomorrow’s technology at a global level with human values through our dedicated team.
                        </p>
                    </div>
                    <div className={styles.photo}>
                        <img src={UrlParser('static/images/visionandmission/VM.webp')} alt="Vision Photo" className={styles.photoImage} />
                    </div>
                </div>

                {/* Mission Section (Centered below Vision, increased width) */}
                <div className={styles.missionWrapper}>
                    <div className={`${styles.missionCard} ${styles.card} bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks`}>
                        <div className={styles.cardHeader}>
                            {/* <Target size={24} className="text-white me-2" /> */}
                            <h2 className={`${styles.cardTitle} text-brwn dark:text-prim border-b-2 border-secd dark:border-drks pb-1`}>Institute Mission</h2>
                        </div>
                        <p className={`${styles.cardContent} text-text dark:text-drkt`}>
                            To provide world-class education in engineering, technology, and management, to foster research & development, to encourage creativity and promote innovation, to build leadership, intrapreneurship, and entrepreneurship and to nurture teamwork and achieve stakeholders’ delight.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Collegevisionmission;