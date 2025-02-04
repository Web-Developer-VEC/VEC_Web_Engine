import React, { useState } from 'react';
import './HostelSidebar.css';
import { User, Clock, PenSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentHistory from './StudentHistory';

const HostelSidebar = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile"); 

    const renderContent = () => {
        switch (activeTab) {
            case "request":
                return <h2>Request Form Component</h2>;
            case "history":
                return <StudentHistory />;
            case "profile":
                return <h2>Profile Component</h2>;
            default:
                return <h2>Profile Component</h2>;
        }
    };

    return (
        <div className="hostel-container flex">
            <div className="student-sidebar">
                <div className="student-sidebar-content">
                    <nav>
                        <button 
                            className={`student-nav-button ${activeTab === "request" ? "student-nav-active" : ""}`} 
                            onClick={() => setActiveTab("request")}
                        >
                            <PenSquare className="student-icon" />
                            Request
                        </button>
                        <button 
                            className={`student-nav-button ${activeTab === "history" ? "student-nav-active" : ""}`} 
                            onClick={() => { 
                                setActiveTab("history");
                                navigate('/hostel/history');
                            }}
                        >
                            <Clock className="student-icon" />
                            Previous Request
                        </button>
                        <button 
                            className={`student-nav-button ${activeTab === "profile" ? "student-nav-active" : ""}`} 
                            onClick={() => setActiveTab("profile")}
                        >
                            <User className="student-icon" />
                            Profile
                        </button>
                    </nav>
                </div>
            </div>

            {/* Render the selected component */}
            <div className="student-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default HostelSidebar;
