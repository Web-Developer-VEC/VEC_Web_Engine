import { Button } from "../../Button";
import { FaSignInAlt } from "react-icons/fa";
import './LoginHost.css'

export default function HostelLogin() {
    return (
        <>
            <div className="hostel-login-container">
                <h2 className="hostel-login-title">Hostel Management System Login</h2>
                <Button className="Hostel-login-button">
                    <FaSignInAlt className="Hostel-login-icon" /> Login
                </Button>
            </div>
        </>
    )
}