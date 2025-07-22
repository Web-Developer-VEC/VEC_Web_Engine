    import React, { useState } from 'react'
    import Banner from '../../Banner'
    import { FaLink } from 'react-icons/fa'

    const HR_Handbook = ({toggle,theme}) => {

        const BASE_URL = process.env.REACT_APP_BASE_URL;
        
        const UrlParser = (path) => {
            return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
        };


    return (

    <>


    <ul>
    <li className='text-sm md:text-lg flex mt-20 items-center gap-2'>
        <FaLink className='text-prim dark:text-drkp' />
        <a href={UrlParser("static/pdfs/handbook/HR-Handbook.pdf")} target="_blank" rel="noopener noreferrer" className='text-blue-600 dark:text-drka hover:underline'>🔗HR Handbook</a>
    </li>
    </ul>

    </>
    )
    }

    export default HR_Handbook;