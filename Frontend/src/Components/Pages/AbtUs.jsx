import React, {useEffect, useState, useRef} from 'react';
import Banner from '../Assets/UnivAbt-5-1.jpg'

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
            <div className='flex justify-center w-screen h-[27.5vh] bg-white
                bg-cover bg-no-repeat bg-[position:0px_-400px]'
                 style={{backgroundImage: `url(${Banner})`}}>
                <div className="absolute grid justify-items-center align-self-center font-popp">
                    <p className="text-white text-6xl">{banTtl}</p>
                    <p className="text-amber-600 text-3xl">{motto}</p><br/>
                </div>
            </div>
            <div className='flex m-8'>
                {/*<div*/}
                {/*    className='font-rome text-center text-[0] animate-spin text-amber-800 p-0 -mb-[0.75vmax] overflow-hidden'>*/}
                {/*    {"Velammal Torture College".split("").map((ltr, i) => (*/}
                {/*        <span className={`animate-[bam_0.5s_ease_forwards]`}*/}
                {/*              style={{animationDelay: `${(i + 3) * 0.15}s`}}>{ltr}</span>*/}
                {/*    ))}*/}
                {/*</div>*/}
                <div className='flex w-full h-[50vh] my-[5vh]'>
                    <div className="basis-3/4 p-4 font-popp mt-14">
                        <p className='text-3xl text-left mb-4'>{secHdr}</p>
                        <p className='text-5xl text-center font-rome'>{secTtl}</p>
                        <p className='text-2xl font-bold text-amber-950 text-center'>{secSub}</p>
                        <p className="text-3xl text-center mt-4">{secCnt}</p>
                    </div>
                    <div className='relative w-full h-[50vh]'>
                        <img className='absolute w-[40%] h-[85%] right-0' src={Banner} alt="Banner Image0"/>
                        <img className='absolute w-[50%] h-[75%] left-[30%] top-[35%] border-[16px] border-white'
                             src={Banner} alt="Banner Image1"/>
                        <img className='absolute w-[25%] h-[45%] left-[43.5%] top-[15%] border-[16px] border-white'
                             src={Banner} alt="Banner Image2"/>
                        {/*<img className='absolute' src={Banner} alt="Banner Image3"/>*/}
                    </div>
                </div>
            </div>
            <div className='flex gap-4 bg-[#eac40a15] border-y-2 border-amber-400 p-4'>
                <div className='min-h-[20vh] min-w-[20vw]'>
                    <img className='w-full h-full rounded-tl-[5rem] rounded-br-[5rem]' src={Banner} alt="Bann"/>
                </div>
                <div>
                    <p className='w-[75%] text-2xl font-popp'>{sec2Cnt}</p>
                </div>
            </div>
            <div className='flex flex-row-reverse gap-4 bg-[#eac40a15] border-y-2 border-amber-400 p-4 my-8'>
                <div className='h-[20vh] min-w-[20vw]'>
                    <img className='w-full h-full rounded-tl-[5rem] rounded-br-[5rem]' src={Banner} alt="Bann"/>
                </div>
                <div>
                    <p className='w-[75%] text-2xl float-right text-right font-popp'>{sec3Cnt}</p>
                </div>
            </div>
        </>
    );
};

export default AbtUs;
