import React from "react";
import "./Footer.css"; // Add your custom CSS for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="contact-details">
        <h3 style={{textDecoration:"underline",textDecorationColor:"orange",textDecorationThickness:"5px",borderbottomStyle:"solid",padding:"15px",margintop:"5px",}}>Contact Address</h3>
        <p style={{ marginTop:"-2%" ,fontSize:"20px",color:"rgb(209, 134, 35", fontWeight:"800"}}>"Velammal New-Gen Park"</p>
        <p>Ambattur Red-hills Road, Surapet,</p>
        <p>Chennai – 600 066. Tamil Nadu, India.</p>
        <p style={{ marginTop: "27px" }}>
          Contact: <a href="tel:+914426590758" style={{ color: "rgb(209, 134, 35", textDecoration: "none"}}>044 – 26590758</a>
        </p>
        <p>
          Career: <a href="mailto:example@example.com" style={{ color: "rgb(209, 134, 35", textDecoration: "none" }}>example@example.com</a>
        </p>
        <p>For Admissions: <a href="tel:+919123547550" style={{ color: "rgb(209, 134, 35", textDecoration: "none" }}>9123547550</a> , <a href="tel:+918939221120" style={{ color: "rgb(209, 134, 35", textDecoration: "none" }}>8939221120</a></p>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1757.9530530830932!2d80.19081618175407!3d13.149609328912868!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5264a10c856599%3A0xac3348f41097ba7f!2sVelammal%20Engineering%20College!5e1!3m2!1sen!2sin!4v1723700873764!5m2!1sen!2sin"
            width="400"
            height="250"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Google Maps"
          ></iframe>
        </div>
      </div>
      <div className="quick-links">
        <div>
        <h3 style={{margintop:"30%",textDecoration:"underline",textDecorationColor:"orange",textDecorationThickness:"5px",borderbottomStyle:"solid"}}>Quick Links</h3>
        <div style={{marginLeft:"30px"}}>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
        </div>
        </div>
        <div style={{marginLeft:"150%", marginTop:"-170%"}}>
        <ul>
          <li><a href="/home">AQR</a></li>
          <li><a href="/about">Best Practices</a></li>
          <li><a href="/services">Institutional </a></li>
          <li><a href="/contact">Feedbacks</a></li>
        </ul>
        </div>
        <div style={{marginLeft:"340%",marginTop:"-200%"}}>
        <ul>
          <li><a href="/home">vec</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer