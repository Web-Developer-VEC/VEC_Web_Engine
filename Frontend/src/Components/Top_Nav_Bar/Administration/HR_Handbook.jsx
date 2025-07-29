    import React, { useEffect, useState } from 'react'
    import Banner from '../../Banner'
    import { FaLink } from 'react-icons/fa'
    import axios from 'axios';

    const HR_Handbook = ({toggle,theme}) => {

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    
    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    const [handBook, sethandbook] = useState(null);

    useEffect(() => {
        const fetchdata = async () => {
            try {
            const response = await axios.post('/api/main-backend/administration',
                {
                    type: "HRHandBook"
                }
            );

            const data = response.data.data;

            console.log(data);
            

            sethandbook(data)
            
            } catch (error) {
            console.error("Error fetching handbook data", error);
            
            }
        }

        fetchdata();
    }, []);


    return (

        <>
            <ul>
                <li className='text-sm md:text-lg flex mt-20 items-center gap-2'>
                    <FaLink className='text-prim dark:text-drkp' />
                    <a href={`${handBook?.pdfs_path[0] ? UrlParser(handBook?.pdfs_path[0]) : '#'}`} target="_blank" rel="noopener noreferrer" className='text-blue-600 dark:text-drka hover:underline'>🔗HR Handbook</a>
                </li>
            </ul>
        </>
        )
    }

    export default HR_Handbook;