import React from "react";
import Banner from "../Banner";
import "./Alumni.css";

const Alumni = ({theme, toggle}) => {
    return (
        <div>
            <Banner theme={theme} toggle={toggle}
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                headerText="Alumni Cell"
                subHeaderText="Get inspired by our Legacy"
            />
        <div className="alumni-container">
            <section className="alumni-section ">
                <h2 className="section-title">Alumni Cell Overview</h2>
                <p className="section-content">
                    The VEC Alumni Cell fosters relationships between alumni, students, and the institution, nurturing lifelong connections and mutual growth. It plays a crucial role in engaging alumni, leveraging their expertise, and strengthening institutional ties for the benefit of current students and the alma mater.
                </p>
            </section>

            <section className="alumni-section two-column">
                <div className="column rounded-xl bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                    dark:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]
                    border-l-4 border-accn dark:border-drka">
                    <h2 className="section-title">Vision</h2>
                    <p className="section-content">
                        To establish a strong, lifelong bond between the institution and its alumni, fostering a mutually beneficial relationship that enhances professional growth, knowledge sharing, and institutional development.
                    </p>
                </div>
                <div className="column rounded-xl bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                    dark:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)]
                    border-l-4 border-accn dark:border-drka">
                    <h2 className="section-title">Mission</h2>
                    <ul className="section-content">
                        <li>To build a dynamic and engaged alumni network that contributes to the academic and career growth of current students.</li>
                        <li>To facilitate mentorship programs, networking opportunities, and industry collaborations through alumni involvement.</li>
                        <li>To organize events and initiatives that strengthen alumni-institution relationships.</li>
                        <li>To create a platform for alumni to contribute to institutional growth through knowledge sharing, placements, and corporate connections.</li>
                    </ul>
                </div>
            </section>

            <section className="alumni-section two-column">
                <div className="column">
                    <h2 className="section-title">Objectives of the Alumni Cell</h2>
                    <ul className="section-content">
                        <li>Strengthening Alumni Network – To create and maintain a strong bond among alumni, faculty, and current students.</li>
                        <li>Mentorship & Career Support – To provide guidance, career counseling, and professional mentorship to students and recent graduates.</li>
                        <li>Industry Collaboration – To leverage alumni expertise for guest lectures, workshops, internships, and job opportunities.</li>
                        <li>Institutional Growth & Development – To contribute to the institution’s progress through feedback, donations, and infrastructure support.</li>
                        <li>Reunions & Networking Events – To organize meetups, reunions, and networking sessions for alumni to reconnect and collaborate.</li>
                        <li>Academic & Research Contributions – To support research, knowledge sharing, and industry-academic collaborations.</li>
                    </ul>
                </div>
            </section>
        </div>
        </div>
    );
};

export default Alumni;