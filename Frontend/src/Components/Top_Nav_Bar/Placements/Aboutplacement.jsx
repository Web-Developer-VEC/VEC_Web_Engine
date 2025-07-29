import React, { useEffect, useState } from "react";
import "./Aboutplacement.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";
import axios from "axios";

const Aboutplacement = ({ theme, toggle }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [placementData, setPlacementData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await axios.post('/api/main-backend/placement',
          {
            type: "about_placement"
          }
        )
        const data = responce.data.data;

        setPlacementData(data);
        
      } catch (error) {
        console.error("error fetching Placement Data",error);
      }
    }
    fetchData();
  }, []);

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
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
}

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Placement Department"
        subHeaderText="Empowering students’ career success by connecting talent with industry leaders and opportunities."
      />

      <div className="AP-main-container">

        {/* Training & Placement*/}
        <section className="AP-grid-TPD">
          <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Training & Placement Department</h2>
            <p className="AP-card-text font-[poppins]">
            {placementData?.Training_Placement_Department[0]}<br />
            {placementData?.Training_Placement_Department[1]}<br />
            {placementData?.Training_Placement_Department[2]}
            </p>
          </div>
        </section>
        <section className="AP-grid-VMC">
            {/* Vision and Mission Section */}
            <section className="AP-grid-VM">
              <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
                <h2 className="AP-card-title font-[poppins] text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Our Vision</h2>
                <p className="AP-card-text font-[poppins] ">
                  {placementData?.Our_Vision}
                </p>
              </div>
              <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
                <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 font-[poppins] border-secd dark:border-drks">Our Mission</h2>
                <p className="AP-card-text font-[poppins]">
                  {placementData?.Our_Mission}
                </p>
              </div>
            </section>

            {/*Contact Section */}
            <section className="AP-grid-CPC font-[poppins]">
              <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
                <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd font-[poppins] dark:border-drks">Contact Placement Cell</h2> <br />
                <h3 className="AP-contact-name font-[poppins] ">Head of Placement and Training</h3> <br />
                <p><strong>✉️Email:</strong><a href={`mailto:${placementData?.email}`} className="text-text font-[poppins] dark:text-drkt">{" "}{placementData?.email}</a></p> <br />
                <p><strong>📞Phone:</strong> <a href={`tel:${placementData?.phone[0]}`} className="text-text font-[poppins] dark:text-drkt">{" "}{placementData?.phone[0]}</a> / <a href={`tel:${placementData?.phone[1]}`} className="text-text font-[poppins] dark:text-drkt">{placementData?.phone[1]}</a></p>
              </div>
            </section>
        </section>

      </div>
    </>
  );
};

export default Aboutplacement;