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
          <a href="/" className="flex flex-col items-center justify-center text-decoration-none select-none ml-4">
              <div className="z-10">
                  <img
                  src="https://res.cloudinary.com/meme-topia/image/upload/v1723784096/image-removebg-preview_ciglfw.png"
                  alt="VEC Logo"
                  className="w-[2.5rem] md:w-[3.5rem] h-auto object-contain transition-all duration-300 ease-in-out"
                  />
              </div>

              <div className="text-center leading-tight mt-1 md:mt-1.5">
                  <span className="font-rome text-[0.75rem] md:text-[1.2rem] text-[#4B1E1E] font-thin block">
                  VELAMMAL
                  </span>
                  <span className="font-rome text-[0.45rem] md:text-[0.8rem] text-gray-800 dark:text-drkt block tracking-wide">
                  ENGINEERING COLLEGE
                  </span>
                  <span className="font-rome text-[0.35rem] md:text-[0.65rem] text-gray-500 italic block">
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