import React from 'react';
import Banner from '../../Banner';
import {useNavigate} from 'react-router-dom';
import './DigiHostel.css';

const DigiHostel = () => {

  const navigate = useNavigate();

  return (
    <>
      <div className="Digi-container">
        <div className="Digi-content border-l-4 border-secd dark:border-drks dark:bg-drkb">
          The Digital Hostel Management System streamlines hostel operations by introducing digital attendance and online gatepass features. Students can mark their attendance using biometric or RFID systems, ensuring accurate and real-time monitoring. Through the official college website, students can apply for outpasses or gatepasses, which are reviewed and approved by the warden digitally. Upon approval, an automatic confirmation message is sent to the respective parents or guardians, keeping them informed about their ward’s movement. This system enhances security, accountability, and communication between the hostel administration and parents, while reducing manual work and delays, promoting a more transparent and efficient hostel environment.
        </div>

        <div className="flex justify-end  mt-5">
          <button className="Digi-button px-3 py-2 bg-secd dark:bg-drks text-white w-fit hover:bg-brwn rounded mr-[15px]"
            onClick={() => navigate('/hostel/login')}
          >
            Digital Hostel
          </button>
        </div>
      </div>
    </>
  );
};

export default DigiHostel;
