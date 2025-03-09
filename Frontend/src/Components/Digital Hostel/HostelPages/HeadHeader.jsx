import { useState, useEffect, useCallback } from "react"

const HostelHeader = () => {
  const [scroll, setScroll] = useState(0)
  const [hdr, setHdr] = useState("")

  const hndlScrll = useCallback(() => {
    const pos = window.scrollY
    const pos_thresh = 0
    if (pos > pos_thresh) {
      setHdr("showoff")
    } else {
      setHdr("")
    }
    setScroll(pos)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", hndlScrll, { passive: true })

    return () => {
      window.removeEventListener("scroll", hndlScrll)
    }
  }, [hndlScrll])

  return (
    <>
      <nav className="fixed z-[100] w-full">
        <div
          className={
            "flex items-center font-popp group bg-white text-slate-200 transition-all ease-in-out duration-300 w-full h-auto h-20"
          }
        >
          <a href="/" className="flex items-center text-decoration-none">
            <div className="bg-inherit z-10">
              <img
                src="https://res.cloudinary.com/meme-topia/image/upload/v1723784096/image-removebg-preview_ciglfw.png"
                alt="Vec Logo"
                className="group-[.hide]:w-[2.5rem] group-[.hide]:h-[2.5rem] z-10 duration-300 ease-in-out transition-all w-[6.5vmax] h-auto"
              ></img>
            </div>
            <div className="w-fit h-auto grid grid-cols-1 gap-y-0 content-center relative group-[.hide]:-mt-1.5 duration-300 ease-out transition-all">
              <span className="font-rome text-[2vmax] text-amber-800 p-0 -mb-[0.75vmax]">VELAMMAL</span>
              <span className="font-rome text-black text-[1vmax] mt-0 p-0 transition-all ease-in-out duration-300">
                ENGINEERING COLLEGE
              </span>
              <span className="font-rome text-black text-[0.7vmax] mt-0 p-0 text-center transition-all ease-in-out duration-300">
                The Wheel of Knowledge rolls on!
              </span>
            </div>
          </a>

          {/* Hostel System Title - Now placed directly in the header */}
          <div className="flex-grow text-center">
            <h1 className="text-[1.7vmax] font-semibold text-amber-800 w-[80%] mx-auto">
              Digital Hostel Management System
            </h1>
          </div>
          </div>
            <div className='hidden lg:flex px-4 pb-1.5 font-popp bg-secd dark:bg-drks text-text dark:text-drkt
                     z-10 w-full h-[0.75rem] rounded-b-lg transition-all'></div>
      </nav>
    </>
  )
}

export default HostelHeader