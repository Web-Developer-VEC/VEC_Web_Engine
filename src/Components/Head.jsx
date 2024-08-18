import { useState, useEffect } from 'react'
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/solid'
import Sidebar from './SideBar'
import Nord from './Assets/1723802229690.png'
import Naac from './Assets/1723802229711.png'
import Acrd from './Assets/1723802229732.png'
import Tnea from './Assets/TNEA-Code.png'
 // import { componentWillUnmount }

const Head = () => {
    const [scroll, setScroll] = useState(0)
    const [hdr, setHdr] = useState("h-20")

    const nacs = [Naac, Acrd,  Nord, Tnea]
    const navs = ["Academics", "Admissions", "COE", "Placements"]

    const hndlScrll = () => {
        const pos = window.scrollY
        const pos_thresh = 0
        console.log(pos)
        if (pos > pos_thresh) {setHdr("h-12 hide")}
        else {setHdr("h-20")} 
        setScroll(pos)
    }

    useEffect(() => {
        window.addEventListener('scroll', hndlScrll, {passive: true})

        return () => {
            window.removeEventListener('scroll', hndlScrll)
        }
    })
    return (
        <>
            {/* <div className='flex font-comf bg-slate-800 rounded-b-lg p-[0.35rem] gap-3 z-10 w-full h-[2.5rem] text-slate-200 fixed'>
                <p className='truncate w-fit'><EnvelopeIcon className='size-5 inline mr-1 mb-1'></EnvelopeIcon>Vec@mail.edu.in</p>
                <p className='truncate mr-[25vw]'><PhoneIcon className='size-5 inline mr-1 mb-1'></PhoneIcon>+91 99456 69420</p>
                    <div className='flex gap-3'>
                    {hdrs.map((txt, i, { length }) => (
                        <p className={'self-end pr-3 mb-1 ' + (( i !== length - 1) ? 'after:content-[""] after:border-r-2 after:h-[50%] after:inline after:pr-6': '')} key={i}>{txt}</p>
                    ))}
                    </div>
            </div> */}
            <nav className={'flex font-comf group bg-slate-200 z-[100] text-slate-200 transition-all ease-in-out duration-300 w-full fixed ' + 
                    'rounded-b-lg border-b-2 border-slate-800 overflow-y-hidden ' + hdr}>
                <div className='bg-inherit z-10 justify-self-start'>
                    <img src='https://res.cloudinary.com/meme-topia/image/upload/v1723784096/image-removebg-preview_ciglfw.png' alt='Vec Logo'
                        className='group-[.hide]:w-[2.5rem] group-[.hide]:h-[2.5rem] z-10 duration-300 ease-in-out transition-all w-[5rem] h-[5rem]'></img>
                </div>    
                <div className='w-fit grid grid-rows-1 ml-2 group-[.hide]:-mt-1.5 duration-300 ease-out transition-all'>
                    <p className='mt-3 font-rome text-2xl text-amber-800'>VELAMMAL</p>
                    <p className='font-rome text-black text-xs group-[.hide]:-translate-x-[20vw] transition-all ease-in-out duration-300'>ENGINEERING COLLEGE</p>
                </div>
                <div class="flex relative h-full justify-center group-[.hide]:-mt-2 min-w-[10rem] ml-[1.5rem] mr-[5vw]">
                    {nacs.map((nac, i) => (
                        <div class="duration-200 ease-linear" data-carousel-item>
                            <img src={nac} class="block max-h-[4rem] mt-2 h-full w-full p-1" alt="naac" key="naac" />
                        </div>
                    ))}
                </div>
                <div className='flex-1 mr-8'>
                    <div className='flex group-[.hide]:text-xl duration-300 ease-in-out transition text-2xl mt-0 justify-end h-full gap-4'>
                        {navs.map((nvt) => (
                            <p className='pt-2 align-middle relative pt-4 top-4 group-[.hide]:top-1 self-center w-fit px-4 
                                hover:bg-[position:100%_0%] text-transparent 
                                bg-gradient-to-l from-amber-500 from-50% via-black via-50% to-black to-90% bg-clip-text bg-[position:0%_0%] bg-[length:200%_100%]
                                min-h-[120%] flex-end hover:ease-out hover:duration-700 ease-in-out duration-300 transition-all'>{nvt}</p>
                        ))}
                    </div>
                </div>
                
                <div className='group-[.hide]:size-5 duration-300 ease-in-out transition-all size-12 border-black m-3 h-fit rounded-md'>
                <Sidebar Sz={((hdr === "h-20") ? "fll": "tny p-0 -mt-4")} /></div>        
            </nav>
        </> 
    )
}


export default Head;