import React, {useEffect, useState, useRef} from 'react';
import Banner from '../Assets/UnivAbt-5-1.jpg'
import Prince from '../Assets/Principal.jpg'
import DirtyPrince from '../Assets/S-Satishkumar.jpg'

const Princ = () => {
    const banTtl = "Principal of VEC"
    const motto = ""
    const secTtl = `Velammal Engineering College`
    const secHdr = 'From the Principal\'s Desk'
    const secSub = "An Autonomous Institution"
    const secCnt = "VEC is one of the leading technical institutions delivering quality education in Tamil Nadu. The strengths of VEC are its proven teaching and learning ecosystem, research and knowledge creation culture and industry collaborations. We help students acquire the knowledge and skills required to become competent and excel in the broader field of Engineering, Technology and Business Administration. We keep our curricula up to date with the latest technological breakthroughs and industry best practises and provide a vibrant intellectual environment for students by fostering critical, reflective, and conceptual thinking, with the purpose of enriching their education and preparing them industry ready through innovative teaching methods."
    const sec2Cnt = "Dr Sathish Kumar"
    const sec3Cnt = "B.E (Mech.Engg.), M.E (Mfg.Tech.),Ph.D"

    return (
        <>
            <div className='relative flex justify-start items-end w-screen h-[20vh] bg-white
                bg-cover bg-no-repeat bg-[position:0px_-550px]'
                 style={{backgroundImage: `url(${Banner})`}}>
                <div className="absolute grid bg-amber-600 rounded-tr-3xl px-4 pt-3 justify-items-end font-popp">
                    <p className="text-white text-5xl">{banTtl}</p>
                    {/*<p className="text-amber-600 text-3xl">{motto}</p><br/>*/}
                </div>
            </div>
            <div className='flex m-8'>
                <div className='flex w-full h-[50vh] my-[5vh]'>
                    <div className="basis-3/4 px-4 font-popp">
                        <p className='text-3xl text-left mb-4'>{secHdr}</p>
                        {/*<p className='text-5xl text-center font-rome'>{secTtl}</p>*/}
                        {/*<p className='text-2xl font-bold text-amber-950 text-center'>{secSub}</p>*/}
                        <q className="text-2xl text-center italic">{secCnt}</q>
                    </div>
                    <div className='grid justify-items-center w-full h-[50vh]'>
                        <img className='w-[70%] max-h-[45vh] h-auto float-right rounded-xl' src={DirtyPrince}
                             alt="Principal"/>
                            <span className='text-4xl font-popp mt-3'>{sec2Cnt}</span>
                            <span className='text-2xl font-rome font-bold text-amber-950'>{sec3Cnt}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Princ;
