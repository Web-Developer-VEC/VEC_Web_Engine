import { Github, Linkedin, Twitter, Mail, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import Banner from "../../../Banner"
import SideNav from "../../SideNav"
import axios from "axios"
import EnquiryWeb from "./enquiryWeb"
import { useLocation } from "react-router-dom"

const SocialIcon = ({ type, url }) => {
  const getIcon = () => {
    switch (type) {
      case "github":
        return <Github className="w-5 h-5" />
      case "linkedin":
        return <Linkedin className="w-5 h-5" />
      case "twitter":
        return <Twitter className="w-5 h-5" />
      case "email":
        return <Mail className="w-5 h-5" />
      case "portfolio":
        return <ExternalLink className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <a
      href={type === "email" ? `mailto:${url}` : url}
      target={type !== "email" ? "_blank" : undefined}
      rel={type !== "email" ? "noopener noreferrer" : undefined}
      className="p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-md"
    >
      {getIcon()}
    </a>
  )
}

const ProfileCard = ({ member }) => {
  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-800 h-[50vh]">
      {/* Background gradient overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" /> */}

      <div className="relative p-6">
        {/* Profile Image */}
        <div className="relative mx-auto w-32 h-32 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
          <img
            src={member?.image}
            alt={member?.name}
            width={128}
            height={128}
            className="relative z-10 w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Member Info */}
        <div className="text-center mb-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {member?.name}
          </h3>
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block">
              {member?.year}
            </p>
            <p className="text-gray-600 dark:text-gray-300 font-medium">{member?.department}</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-3">
          {Object.entries(member?.social)?.map(([platform, url]) => (
            <div key={platform} className="transform transition-transform duration-300 hover:scale-110">
              <SocialIcon type={platform} url={url} />
            </div>
          ))}
        </div>

        {/* Hover effect border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-2xl transition-colors duration-500" />
      </div>
    </div>
  )
}

function WebUI({ title, data }) {

    console.log("Data",data);

    let des;
    let members;

    if (data) {
      des = data[0]?.content;
      members = data[1]?.content;
    }
    
    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 h-fit">
            {/* Header Section */}
            <div className="relative overflow-hidden">
                {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-10" /> */}
                <div className="relative max-w-7xl mx-auto p-4">
                    <div className="text-center">
                        <h1 className="text-[32px] font-bold text-black dark:text-white mb-6">
                        Meet Our{" "}
                        <span className="bg-gradient-to-r from-brwn to-drka bg-clip-text text-transparent">
                            Amazing {title} Batch
                        </span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Team Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
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
            <div className="bg-gray-300 dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-brwn dark:text-drkt mb-4">Want to Know about Our Team?</h2>
                    <p className="text-black mb-8 max-w-2xl mx-auto">
                    {des?.message}
                    </p>
                </div>
                </div>
            </div>

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
    const [webtab,setWebtab] = useState("Pilot");
    const [webdata,setWebData] = useState(null);
    const location = useLocation();

    const navData = {
        "Enquiry Now": <EnquiryWeb/>,
        "Pilot": <WebUI title={"Pilot"} data={webdata}/>,
        "Co-Pilot": <WebUI title={"Co Pilot"} data={webdata}/>,
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab === "enquiry") {
          setWebtab("Enquiry Now");
        }
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
          const typeMap = {
            "Pilot": "pilot",
            "Co-Pilot": "copilot"
          }
            try {
                const response = await axios.post('/api/main-backend/web_team',
                  {
                    type: typeMap[webtab]
                  }
                );
    
                const data = response.data.data;
    
                setWebData(data);
            } catch (error) {
                console.error("Error fetching Web Team data",error);
            }
        }
        fetchData();
    }, [webtab])

  return (
     <>
       <Banner
            toggle={toggle} theme={theme}
            backgroundImage="./Banners/Accreditations_Ranking.webp"
            headerText="Web Team"
            subHeaderText="Website developed by these idiot"
        />
    
        <div className="">
          <SideNav  sts={webtab} setSts={setWebtab} navData={navData} cls={""}/>
        </div>
      </>
  )
}
