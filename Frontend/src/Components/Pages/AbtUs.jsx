import React, {useEffect, useState, useRef} from 'react';
import Bannerimg from '../Assets/UnivAbt-5-1.jpg';
import Banner from '../Banner';

const AbtUs = () => {
    const banTtl = "About VEC"
    const motto = "A Journey of Thousand Miles Begins with a Single Step"
    const secTtl = `Velammal Engineering College`
    const secHdr = 'Welcome to,'
    const secSub = "An Autonomous Institution"
    const secCnt = "We stand for innovation, with our diverse community of scholars and engineers dedicated " +
        "to making a positive impact at local, national, and global levels."
    const sec2Cnt = "Velammal Engineering College (Autonomous) is affiliated to Anna University and is approved by the All India Council for Technical Education (AICTE). The institution was certified ISO 9001:2015 by M/s. TUV NORD, Germany, in just 5 years of its inception. The college is accredited by NAAC and all the UG programmes are accredited by NBA. Based in Chennai city, VEC, the safe campus, offers a truly unrivalled study experience with various courses, outstanding facilities, comprehensive support and highly disciplined life. "
    const sec3Cnt = "Velammal Engineering College achieved its autonomous status in the year 2019. Autonomy can be found in the choice of curriculum, pedagogy and evaluation systems. It helps students to carve a niche for themselves as they have greater flexibility towards academic development for improvement of academic standards and excellence."

    return (
        <>
<Banner
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="About VEC"
  subHeaderText="A center for academic excellence and innovation, nurturing minds to create a brighter future through education and empowerment."
/>


            <div className='flex m-8'>
                {/*<div*/}
                {/*    className='font-rome text-center text-[0] animate-spin text-amber-800 p-0 -mb-[0.75vmax] overflow-hidden'>*/}
                {/*    {"Velammal Torture College".split("").map((ltr, i) => (*/}
                {/*        <span className={`animate-[bam_0.5s_ease_forwards]`}*/}
                {/*              style={{animationDelay: `${(i + 3) * 0.15}s`}}>{ltr}</span>*/}
                {/*    ))}*/}
                {/*</div>*/}
                <div className='flex w-full h-[50vh] my-[5vh] mb-40'>
                    <div className="basis-3/4 p-4 font-popp mt-14">
                        <p className='text-3xl text-left mb-4'>{secHdr}</p>
                        <p className='text-5xl text-center font-rome'>{secTtl}</p>
                        <p className='text-2xl font-bold text-amber-950 text-center'>{secSub}</p>
                        <p className="text-3xl text-center mt-4">{secCnt}</p>
                    </div>
                    <div className='relative w-full h-[50vh]'>
                        <img className='absolute w-[40%] h-[85%] right-0' src={Bannerimg} alt="Banner Image0"/>
                        <img className='absolute w-[50%] h-[75%] left-[30%] top-[35%] border-[16px] border-white'
                             src={Bannerimg} alt="Banner Image1"/>
                        <img className='absolute w-[25%] h-[45%] left-[43.5%] top-[15%] border-[16px] border-white'
                             src={Bannerimg} alt="Banner Image2"/>
                        {/*<img className='absolute' src={Banner} alt="Banner Image3"/>*/}
                    </div>
                </div>
            </div>
            <div className="flex gap-8 bg-gradient-to-r from-[#fffbea] to-[#fef6d9] border-y-4 border-amber-400 p-10 shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300 ease-in-out">
    <div className="relative group min-h-[20vh] min-w-[20vw]">
        <img
            className="w-full h-full rounded-tl-[2rem] rounded-br-[2rem] object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            src={Bannerimg}
            alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 rounded-tl-[2rem] rounded-br-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
    </div>
    <div className="flex flex-col justify-center">
        <p className="text-2xl font-semibold text-gray-800 font-popp leading-relaxed tracking-wide">
            {sec2Cnt}
        </p>
    </div>
</div>

<div className="flex flex-row-reverse gap-8 bg-gradient-to-r from-[#fffbea] to-[#fef6d9] border-y-4 border-amber-400 p-10 my-14 shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300 ease-in-out">
    <div className="relative group h-[20vh] min-w-[20vw]">
        <img
            className="w-full h-full rounded-tl-[2rem] rounded-br-[2rem] object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            src={Bannerimg}
            alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 rounded-tl-[2rem] rounded-br-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
    </div>
    <div className="flex flex-col justify-center">
        <p className="text-2xl font-semibold text-gray-800 text-justify font-popp leading-relaxed tracking-wide">
            {sec3Cnt}
        </p>
    </div>
</div>
        </>
    );
};

export default AbtUs;