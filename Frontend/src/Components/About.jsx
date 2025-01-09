import React from 'react'
import "./About.css";
import Tree from "./Assets/Banyan.jpg";

const About = () => {
  return (
    <div className='abt bg-white w-full font-popp overflow-hidden'>
        <div className='max-w-[60%] px-12 subpixel-antialiased font-medium'>
          <h5 className='text-[2.5lvh]' style={{color:"maroon", marginTop:"40px"}}>A Journey of Thousand Miles Begins with a Single Step</h5>
          <br></br>
          <p className='text-[5lvh]'>Velammal Engineering College</p>
          <h4 style={{color:"gray"}} className='text-[2.5lvh]'>An Autonomous Institution</h4>
          <br></br>
          <div className='abt2 text-[2.5lvh]'>
              <p>The Velammal Educational Trust is a registered non-minority service organization established in the year 1986 by Thiru. M.V. Muthuramalingam inculcates among the youth a sense of discipline which is important to mould them into useful and capable citizens. The watchwords of the Trust are “Dedication, Determination, and Distinction”.</p>
          </div>
          <div className='abt3 text-[2.5lvh]'>
              <p>Velammal Engineering College was established in the year 1995-96 to impart quality education. It is a self-financing non-minority institution, affiliated to Anna University and approved by the All India Council for Technical Education (AICTE) and also an ISO-certified institution.</p>
          </div>
        </div>
        <div className='lg:block hidden image'>
          <img src={Tree} className='h-[100%] min-w-[25%]'  alt="Banyan Tree" />
        </div>
    </div>
  )
}

export default About
