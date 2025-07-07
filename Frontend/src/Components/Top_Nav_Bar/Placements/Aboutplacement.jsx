import React, { useEffect, useState } from "react";
import "./Aboutplacement.css";
import Banner from "../../Banner";
import LoadComp from "../../LoadComp";

const Aboutplacement = ({ theme, toggle }) => {
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
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Placement Department"
        subHeaderText="Empowering students’ career success by connecting talent with industry leaders and opportunities."
      />

      <div className="AP-main-container">

        {/* Training & Placement*/}
        <section className="AP-grid-TPD">
          <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
            <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Training & Placement Department</h2>
            <p className="AP-card-text">
            The  Training & Placement Department is committed to bridging the gap between academic learning and industry expectations. Our primary objective is to equip students with the right skills and opportunities to secure engineering jobs and pursue higher education globally. <br />
            Training is seamlessly integrated into the curriculum from the second year onwards, ensuring a structured and progressive learning experience. Our program focuses on technical expertise, equipping students with industry-relevant engineering skills, soft skills and communication, fostering professionalism and leadership, and foreign languages, enhancing global career prospects. This holistic approach prepares students to excel in both placements and higher education opportunities. <br />
            Our industry-aligned methodology includes expert-led sessions, real-world projects, mock interviews, and technical assessments. More than 300+ reputed National and Multinational companies visit our institution for campus recruitment annually. As a result, our graduates consistently secure top placements in reputed engineering firms and excel in competitive exams for higher studies.
            </p>
          </div>
        </section>
        <section className="AP-grid-VMC">
            {/* Vision and Mission Section */}
            <section className="AP-grid-VM">
              <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
                <h2 className="AP-card-title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Our Vision</h2>
                <p className="AP-card-text">
                  Department of Training & Placement aims to educate, advise, and connect students to opportunities for their career growth in order to foster their intellectual, social, and personal transformations.
                </p>
              </div>
              <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
                <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Our Mission</h2>
                <p className="AP-card-text">
                  The department focuses on bringing the most relevant professional opportunities for the learners through various initiatives and activities.
                </p>
              </div>
            </section>

            {/*Contact Section */}
            <section className="AP-grid-CPC">
              <div className="AP-card bg-drkt dark:bg-drkb border-l-4 border-secd dark:border-drks">
                <h2 className="AP-card-title title text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks">Contact Placement Cell</h2> <br />
                <h3 className="AP-contact-name ">Head of Placement and Training</h3> <br />
                <p><strong>✉️Email:</strong><a href="mailto: placement@velammal.edu.in" className="text-text dark:text-drkt"> placement@velammal.edu.in</a></p> <br />
                <p><strong>📞Phone:</strong> <a href="tel:9940127839" className="text-text dark:text-drkt">9940127839</a> / <a href="tel:9444008233" className="text-text dark:text-drkt">9444008233</a></p>
              </div>
            </section>
        </section>

      </div>
    </>
  );
};

export default Aboutplacement;