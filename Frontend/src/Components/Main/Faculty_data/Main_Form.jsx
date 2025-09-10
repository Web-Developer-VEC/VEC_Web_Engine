import React from 'react'
import { useNavigate } from "react-router-dom";


const Main_Form = () => {

    const navigate = useNavigate();

    const goToAddFac = ()=> {
       navigate("/New_Faculty_data")
    }
    const goToUpdateFac = ()=> {
       navigate("/Old_Faculty_data")
    }

  return (

    <>
    
    <div className='faculty-main-content flex flex-col items-center w-[60%]  m-auto p-10 mt-10 gap-10'>
        <h2> Faculty Form </h2>
        <div className='filling-instruction w-[100%] bg-gray-400 pl-4 p-4'>
            <li>fill the input field correctly  </li>
            <li> Enter the details based on the required value  </li>
            <li> The form is very significant . if you submit the form you cannot return the value </li>
            <li>fill the input field correctly  </li>
            <li>fill the input field correctly  </li>
            <li>fill the input field correctly  </li>
        </div>
        <div className='flex flex-row gap-10 '>
            <div className='bg-secd p-2'>
                <button onClick={goToAddFac}>
                    New Faculty Details 
                </button>
            </div>
            <div className='bg-secd p-2'>
                <button onClick={goToUpdateFac}>
                    Changing existing Faculty Details 
                </button>
            </div>
        </div>
    </div>

    </>
  )
}

export default Main_Form