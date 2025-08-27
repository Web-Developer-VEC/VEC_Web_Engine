import { Github, Linkedin, Twitter, Mail, ExternalLink, Globe2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import Banner from "../../../Banner"
import SideNav from "../../SideNav"
import axios from "axios"
import EnquiryWeb from "./enquiryWeb"
import { useNavigate } from "react-router";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};


const SocialIcon = ({ type, url }) => {
  const getIcon = () => {
    switch (type) {
      case "github":
        return <Github className="w-5 h-5 md:w-6 md:h-6" />
      case "linkedin":
        return <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
      case "twitter":
        return <Twitter className="w-5 h-5 md:w-6 md:h-6" />
      case "email":
        return <Mail className="w-5 h-5 md:w-6 md:h-6" />
      case "portfolio":
        return <Globe2Icon className="w-5 h-5 md:w-6 md:h-6" />
      default:
        return null
    }
  }

  return (
    <a
      href={type === "email" ? `mailto:${url}` : url}
      target={type !== "email" ? "_blank" : undefined}
      rel={type !== "email" ? "noopener noreferrer" : undefined}
      className="p-2 rounded-full cursor-pointer transition-transform duration-500 ease-in-out hover:scale-[1.05] hover:shadow-md dark:hover:shadow-blue-900"
    >
      {getIcon()}
    </a>
  )
}

const StaffCard = ({ member }) => {
  return (
    <div className="bg-prim dark:bg-drkp rounded-2xl shadow-md p-4 md:flex justify-between w-[80vw] md:w-[40vw] lg:w-[30vw] items-center text-center border border-gray-100 dark:border-gray-700 ">
      <div className="w-28 h-28 md:w-32 md:h-32 mb-4 ml-[30%] md:ml-0 lg:ml-0">
        <img
          src={UrlParser(member?.image)}
          alt={member?.name}
          className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800 shadow"
        />
      </div>
      <div className="w-full md:w-[15vw]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-blue-300">{member?.name}</h3>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{member?.club_designation}</p>
      </div>
    </div>
  )
}

const ProfileCard = ({ member }) => {
  return (
    <div className="group relative bg-prine dark:bg-[#1c1f26] rounded-2xl shadow-lg dark:shadow-md hover:shadow-2xl dark:hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex flex-col justify-between h-full p-6 space-y-4">
        {/* Top: Image and Info */}
        <div className="flex flex-col items-center space-y-4">
          {/* Circular Image */}
          <div className="relative w-28 h-28 md:w-32 md:h-32">
            <img

              src={UrlParser(member?.image)}

              alt={member?.name}
              className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-md transition-transform duration-500 group-hover:scale-105 dark:brightness-75"
            />
          </div>

          {/* Member Info */}
          <div className="text-center space-y-2">

            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-blue-300 group-hover:text-brwn dark:group-hover:text-blue-400 transition-colors duration-300">
              {member?.name}
            </h3>
            <p  className=" font-medium text-[16px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block" >{member?.club_designation}</p>
           
            {/* <p className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block">
              {member?.year}
            </p> */}
            <p className="text-gray-600 text-[14px] dark:text-gray-400 font-medium"> {member?.year}  </p>
            <p className="text-gray-600 text-[14px] dark:text-gray-400 font-medium"> {member?.department} </p>
          </div>
        </div>

        {/* Bottom: Social Icons */}
        <div className="flex justify-center space-x-3 pt-4">
          {Object.entries(member?.social || {})?.map(([platform, url]) => (
            <SocialIcon key={platform} type={platform} url={url} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WebUI({ title, data }) {

  let des, members, staff
  if (data) {
    des = data[0]?.content
    members = data[1]?.content
    staff = data[2]?.content
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="text-center py-6 px-4">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-brwn dark:text-white mt-6">
          Meet Our Amazing {title} Batch 
        </h1>
      </div>

      {/* Team Grid */}
      {/* Staff Cards Section */}
      {staff && staff.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
            {staff.map((member, index) => (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: "both",
                }}
              >
                <StaffCard member={member} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members?.map((member, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: "both",
              }}
            >
              <ProfileCard member={member} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-300 dark:bg-black mt-6">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-brwn dark:text-blue-300 mb-2">
            Want to Know about Our Team?
          </h2>
          <p className="text-text dark:text-prim">{des?.message}</p>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function Webteam({ toggle, theme }) {
  const [webtab, setWebtab] = useState("Pilot")
  const [webdata, setWebData] = useState(null)
  const navigate = useNavigate();

  const navData = {
    "Enquiry Now": <EnquiryWeb />,
    "Pilot": <WebUI title={"Pilot"} data={webdata} />,
    "Co-Pilot": <WebUI title={"Co Pilot"} data={webdata} />,
  }

  useEffect(() => {
    const fetchData = async () => {
      const typeMap = {
        Pilot: "pilot",
        "Co-Pilot": "copilot",
      }
      try {
        const response = await axios.post("/api/main-backend/web_team", {
          type: typeMap[webtab],
        })
        const data = response.data.data
        setWebData(data)
      } catch (error) {
        console.error("Error fetching Web Team data", error);
         if (error.response.data.status === 429) {
            navigate('/ratelimit', { state: { msg: error.response.data.message}})
            } 
      }
    }
    fetchData()
  }, [webtab])

  return (
    <>
      <Banner
        toggle={toggle}
        theme={theme}
        backgroundImage="./Banners/Web_Team_Banner_Updated.webp"
        headerText="WebOps"
        subHeaderText="Meet Our Team"
      />
      <div>
        <SideNav sts={webtab} setSts={setWebtab} navData={navData} cls={""} />
      </div>
    </>

  )
}
