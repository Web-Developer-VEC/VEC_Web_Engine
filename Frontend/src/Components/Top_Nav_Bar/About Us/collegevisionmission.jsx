import React, { useEffect, useState } from "react";
import styles from "./collegevisionmission.module.css";
import { Eye, Target } from "lucide-react"; // Importing icons
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";

const Collegevisionmission = ({ theme, toggle }) => {

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [vmData, setvmData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.get('/api/about_us');
                const data = responce.data[0];
                setvmData(data.vision_and_mission);
                
            } catch (error) {
                console.error("Error fetching about us data",error);
            }
        }
        fetchData();
    }, [])

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
                backgroundImage="./Banners/aboutvec.webp"
                headerText="Vision & Mission"
                subHeaderText="Empowering a better tomorrow through innovation and integrity"
            />
            {vmData ? (
                <div className={styles.visionMissionContainer}>
                    {/* Vision Section (Left) and Photo (Rightmost) */}
                    <div className={styles.visionWrapper}>
                        <div className={`${styles.visionCard} ${styles.card} bg-prim dark:bg-drkb border-l-4 border-secd dark:border-drks`}>
                            <div className={styles.cardHeader}>
                                {/* <Eye size={24} className="text-white me-2" /> */}
                                <h2 className={`${styles.cardTitle} text-brwn dark:text-prim border-b-2 border-secd dark:border-drks pb-1`}>Institute Vision</h2>
                            </div>
                            <p className={styles.cardContent}>
                                {vmData?.vision}
                            </p>
                        </div>
                        <div className={styles.photo}>
                            <img src={UrlParser(vmData?.image_path)} alt="Vision Photo" className={styles.photoImage} />
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
                                {vmData?.mission}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
                    <LoadComp txt={""} />
                </div>
            )}
        </div>
    );
};

export default Collegevisionmission;