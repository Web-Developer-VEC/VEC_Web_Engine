import React from 'react'
import "./About.css";
import Tree from "../Assets/announce.png";

const About = () => {
    return (
        <div className='abt flex mx-auto bg-prim dark:bg-drkp text-text dark:text-drkt w-[95%] font-popp overflow-hidden'>
            <div className='max-w-full lg:max-w-[60%] text-center px-4 lg:px-12 subpixel-antialiased font-medium'>
                <h5 className='text-xl text-accn dark:text-drka mt-4 lg:mt-12'>A Journey of Thousand Miles Begins with
                    a
                    Single Step</h5>
                <p className='text-5xl tracking-tighter'>Velammal Engineering College</p>
                <h4 style={{color: "gray"}} className='text-xl'>An Autonomous Institution</h4>
                <br></br>
                <div className='abt2 text-lg lg:text-xl text-justify'>
                    <p>The Velammal Educational Trust is a registered non-minority service organization established in
                        the year 1986 by Thiru. M.V. Muthuramalingam inculcates among the youth a sense of discipline
                        which is important to mold them into knowledgeable and skilled citizens. The watchwords of the Trust
                        are “Dedication, Determination, and Distinction”.</p>
                </div>
                <div className='abt3 mt-4 text-lg lg:text-xl text-justify'>
                    <p>Velammal Engineering College was established in the year 1995 to impart quality higher education. It
                        is a self-financing non-minority institution, affiliated to Anna University and approved by the
                        All India Council for Technical Education (AICTE) and also an ISO-certified institution.</p>
                </div>
            </div>
            <div className='lg:block hidden image'>
                <img src={Tree} className='h-[100%] min-w-[75%] w-auto' alt="Banyan Tree"/>
            </div>
        </div>
    )
}

export default About
