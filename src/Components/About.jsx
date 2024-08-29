import React from 'react'
import "./About.css";
import Tree from "./Assets/Banyan.jpg";

const About = () => {
  return (
    <div className='abt bg-white font-popp'>
        <div className='text'>
          <h5 style={{color:"maroon", marginTop:"40px"}}>A Journey of Thousand Miles Begins with a Single Step</h5>
          <br></br>
          <h1>Velammal Engineering College</h1>
          <h4 style={{color:"gray"}}>An Autonomous Institution</h4>
          <br></br>
          <div className='abt2'>
              <p>The Velammal Educational Trust is a registered non-minority service organization established in the year 1986 by Thiru. M.V. Muthuramalingam inculcates among the youth a sense of discipline which is important to mould them into useful and capable citizens. The watchwords of the Trust are “Dedication, Determination, and Distinction”.</p>
          </div>
          <div className='abt3'>
              <p>Velammal Engineering College was established in the year 1995-96 to impart quality education. It is a self-financing non-minority institution, affiliated to Anna University and approved by the All India Council for Technical Education (AICTE) and also an ISO-certified institution.</p>
          </div>
        </div>
        <div className='image'>
          <img src={Tree}  alt="Banyan Tree" />
        </div>
    </div>
  )
}

export default About
