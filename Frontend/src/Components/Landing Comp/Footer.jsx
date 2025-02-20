import React, {forwardRef} from "react";//+
import "./Footer.css"; // Add your custom CSS for styling
import insta from '../Assets/insta-logo.png';
import linkedin from '../Assets/linkedin-logo.png';
import youtube from '../Assets/youtube.png';
import x from '../Assets/X-logo.png';
import facebook from '../Assets/facebook-logo.png';

const Footer = forwardRef((props, ref) => {
    const color = (props.theme === "light") ? "rgb(253,204,3)" : "rgb(255, 87, 34)";

    return (
        <footer id="footer" className="lg:flex flex-wrap footer font-popp
            bg-[linear-gradient(111deg,theme(colors.secd)_0%,theme(colors.secd)_3%,theme(colors.text)_3%,theme(colors.text)_90%,theme(colors.secd)_90%,theme(colors.secd)_100%)]
            dark:bg-[linear-gradient(111deg,theme(colors.drks)_0%,theme(colors.drks)_3%,theme(colors.text)_3%,theme(colors.text)_90%,theme(colors.drks)_90%,theme(colors.drks)_100%)]
            " ref={ref}>
            <div className="contact-details basis-1/4 ml-4">
                <h3 className="text-secd dark:text-drks" style={{padding: "0 20px", margintop: "5px"}}>Contact
                    Address</h3>
                <p style={{marginTop: "-2%", fontSize: "17px", color: "white"}}>Velammal Engineering College<br></br>Ambattur
                    Red-hills Road, Surapet,<br></br>Chennai – 600 066. Tamil Nadu, India.</p>
                <p style={{marginTop: "27px"}}>
                    Contact: <a className="text-secd dark:text-drks" href="tel:+914426590758"
                                style={{textDecoration: "none"}}>044 – 26590758</a>
                </p>
                <p>
                    Career: <a href="mailto:example@example.com" className="text-secd dark:text-drks"
                               style={{textDecoration: "none"}}>example@example.com</a>
                </p>
                <p>For Admissions: <a href="tel:+919123547550" className="text-secd dark:text-drks"
                                      style={{textDecoration: "none"}}>9123547550</a> , <a
                    href="tel:+918939221120" className="text-secd dark:text-drks" style={{textDecoration: "none"}}>
                    8939221120</a>
                </p>
                <div className="logo-container my-2">
                    <img src={insta} alt="Insta"/>
                    <img src={linkedin} alt="linkedin"/>
                    <img src={youtube} alt="youtube"/>
                    <img src={x} alt="twitter"/>
                    <img src={facebook} alt="facebook"/>
                </div>
                {/*mt-4 lg:mt-[-240px] lg:ml-[375px]">*/}
                {/*    <iframe className="w-[90%] h-[15%] lg:w-[25vw] lg:h-[30vh] 2xl:h-[20vh] lg:mt-[-15rem]*/}
            </div>
            <div className="basis-1/3 h-[30vh] mb-16">
                <iframe className="px-3 w-full h-full"
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1757.9530530830932!2d80.19081618175407!3d13.149609328912868!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5264a10c856599%3A0xac3348f41097ba7f!2sVelammal%20Engineering%20College!5e1!3m2!1sen!2sin!4v1723700873764!5m2!1sen!2sin"
                        width="400"
                        height="260"
                        style={{border: 0}}
                        allowFullScreen=""
                        loading="lazy"
                        title="Google Maps"
                ></iframe>
            </div>
            <div className="quick-links basis-1/3 px-4">
                <h3 className="text-secd dark:text-drks">Quick Links</h3>
                <ul className="gap-x-8 h-[15vh]">
                    <li><a href="/home">Home</a></li>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/services">Services</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li><a href="/home">AQR</a></li>
                    <li><a href="/about">Best Practices</a></li>
                    <li><a href="/services">Institutional </a></li>
                    <li><a href="/contact">Feedbacks</a></li>
                    <li><a href="/home">Vec</a></li>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/services">Services</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </div>
        </footer>
    );
});

export default Footer;