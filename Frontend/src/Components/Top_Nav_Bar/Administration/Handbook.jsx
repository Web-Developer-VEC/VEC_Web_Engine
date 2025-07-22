import React, { useEffect } from 'react'
import Banner from '../../Banner'
import { a, div } from 'framer-motion/m'
import { FaLink } from 'react-icons/fa'

const Handbook = ({toggle,theme}) => {

   

    const handbooks = 
    {
        "HB":{
        "Years":["2018-2019","2019-2020","2020-2021","2021-2022","2022-2023","2023-2024","2024-2025"],
        "pdfspath":["/static/pdfs/handbook/Handbook-18-19.pdf","/static/pdfs/handbook/Handbook-19-20.pdf","/static/pdfs/handbook/Handbook-20-21.pdf","/static/pdfs/handbook/Handbook-21-22.pdf","/static/pdfs/handbook/HandBook-22-23.pdf","/static/pdfs/handbook/HandBook-23-24.pdf","/static/pdfs/handbook/Revised_New_Hand_Book_24-25.pdf"]
        }
    }
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

  return (
    <>
   <Banner toggle={toggle} theme={theme}
    backgroundImage="./Banners/administrationbanner.webp"
    headerText="Handbook"
    subHeaderText="Comprehensive manual for students and staff"
    />
      
     <div className="flex flex-wrap justify-center  text-xl my-12 gap-8 mb-48">
        <h2 className={"basis-full text-center text-[24px] text-brwn dark:text-drkt"}> Handbook</h2>
        {handbooks.HB.Years.map((year, index) => (
  <a
    key={index}
    href={UrlParser(handbooks.HB.pdfspath[index])}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:underline hover:text-text dark:hover:text-drkt dark:text-drka"
  >
    <FaLink className="inline size-5 mr-1 mb-1" />
    {year}
  </a>
))}
   
    </div>

    </>
  )
  
}

export default Handbook;