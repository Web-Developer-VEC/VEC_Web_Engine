import { useState,useEffect } from "react";
import { Bars3Icon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import Inta from './Assets/instagram.png'
import Fcbk from './Assets/facebook.png'
import Twtr from './Assets/twitter.png'
import Lknd from './Assets/linkedin.png'

 // Import Framer Motion // Import Framer Motion
const Sidebar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (activeIndex !== null) {
      setTitle(navs[activeIndex].main);
    } else {
      setTitle("Navigation");
    }
  }, [activeIndex]);
  
  const navigate = useNavigate();
  const socls = [
    { Name: "Instagram", Link: "https://instagram.com", Ico: Inta, Fltr: "invert-[133%] sepia-[50%] saturate-[1732%] hue-rotate-[302deg] brightness-[94%] contrast-[85%]" },
    { Name: "Facebook", Link: "https://facebook.com", Ico: Fcbk, Fltr: "" },
    { Name: "Twitter", Link: "https://twitter.com", Ico: Twtr, Fltr: "" },
    { Name: "LinkedIn", Link: "https://linkedin.com", Ico: Lknd, Fltr: "" },
  ];
  
  const navs = [
    {main: "About Us", cod:[0, 5], cols: 1, sub: [
        {hrd: false, ttl: 'About VEC', sup: [], lnk: '/abt-us'},
        {hrd: false, ttl: 'About Trust', sup: [], lnk: '/trust'}, 
        {hrd: false, ttl: 'Vision & Mission', sup: [], lnk: 'v_m'},
        {hrd: false, ttl: 'Management', sup: [], lnk: '/management'}, 
        { hrd: false, ttl: "Contact Us", sup: [], lnk: "#footer" }, // Link to footer
    ]}, 
    {main: "Administration", cod:[0, 5], cols: 1, sub: [
        {hrd: false, ttl: 'Principal', sup: [], lnk: '/principal'},
        {hrd: false, ttl: "Dean's & Asso Dean's", sup: [], lnk: '/dean'}, 
        {hrd: false, ttl: 'Admin Office', sup: [], lnk: '/admin'}, 
        {hrd: false, ttl: "Committee's", sup: [], lnk: '/committee'},
        {hrd: false, ttl: 'Organization Chart', sup: [], lnk: '/clg-org'}
    ]},
    {main: "Academics", cod:[0, 11, 13], cols: 2, sub: [
        {hrd: true, ttl: 'UG Courses', sup: [], lnk: ''},
        {hrd: false, ttl: 'Artificial Intelligence and Data Science', sup: [], lnk: '/dept/001', deptID: "001",},
        {hrd: false, ttl: 'Automobile Engineering', sup: [], lnk: '/dept/002', deptID: "002",},
        {hrd: false, ttl: 'Civil Engineering', sup: [], lnk: '/dept/004' ,deptID: "004",},
        {hrd: false, ttl: 'Computer Science and Engineering', sup: [], lnk: '/dept/005', deptID: "005",},
        {hrd: false, ttl: 'Computer Science and Engineering (Cyber Security)', sup: [], lnk: '/dept/006', deptID: "006",},
        {hrd: false, ttl: 'Electrical and Electronics Engineering', sup: [], lnk: '/dept/007', deptID: "007",},
        {hrd: false, ttl: 'Electronics and Communication Engineering', sup: [], lnk: '/dept/009', deptID: "009",},
        {hrd: false, ttl: 'Electronics and Instrumentation Engineering', sup: [], lnk: '/dept/008', deptID: "008",},
        {hrd: false, ttl: 'Information Technology', sup: [], lnk: '/dept/011', deptID: "011",},
        {hrd: false, ttl: 'Mechanical Engineering (ME)', sup: [], lnk: '/dept/013', deptID: "013",},
        {hrd: true, ttl:  'PG Courses', sup: [], lnk: ''},
        {hrd: false, ttl: 'M.E. Computer Science & Engineering', sup: [], lnk: '/dept/002', deptID: "001",},//
        {hrd: false, ttl: 'M.E. Power System Engineering', sup: [], lnk: '/dept/002', deptID: "001",},//
        {hrd: false, ttl: 'Master Of Business Administration (MBA)', sup: [], lnk: '/dept/002', deptID: "001",}, //
        {hrd: true, ttl: 'Science & Humanities', sup: [], lnk: ''},
        {hrd: false, ttl: 'Chemistry', sup: [], lnk: '/dept/003', deptID: "003",}, 
        {hrd: false, ttl: 'English', sup: [], lnk: '/dept/010', deptID: "010",}, 
        {hrd: false, ttl: 'Mathematicis', sup: [], lnk: '/dept/012', deptID: "012",}, 
        {hrd: false, ttl: 'Physics', sup: [], lnk: '/dept/015', deptID: "015",}, 
        {hrd: false, ttl: 'Tamil', sup: [], lnk: '/dept/002', deptID: "001",}, //

    ]},  
    {main: "Admission", cod:[0, 4], cols: 1, sub: [
        {hrd: false, ttl: 'B.E/B.Tech Admission', sup: [], lnk: '/ug'},
        {hrd: false, ttl: 'M.E Admission', sup: [], lnk: '/m_e'},
        {hrd: false, ttl: 'MBA Admission', sup: [], lnk: '/mba'},
        {hrd: false, ttl: 'Ph.D Programme Details', sup: [], lnk: ''}
    ]}, 
    {main: "Exams", cod:[0, 4], cols: 1, sub: [
        {hrd: false, ttl: 'Regulation', sup: [], lnk: '/reg'}, 
        {hrd: false, ttl: 'Curriculum & Syllabus', sup: [], lnk: '/Syllabus'},
        {hrd: false, ttl: 'Student Verification', sup: [],  lnk: 'https://vecchennai.directverify.in/student/#/app/request',openInNewTab: true},
        {hrd: false, ttl: 'All Forms', sup: [], lnk: '/form'}

    ]}, 
    {
        main: "Research",
        cod:[0, 5], cols: 1, sub: [
            {hrd: false, ttl: 'Academic Research', sup: [], lnk: ''},
            {hrd: false, ttl: 'Sponsored Research', sup: [], lnk: ''},
            {hrd: false, ttl: 'Publication', sup: [
                {hrd: false, ttl: 'Journal', sup: [], lnk: ''},
                {hrd: false, ttl: 'Conference', sup: [], lnk: ''}
            ], lnk: ''},
            {hrd: false, ttl: 'Patents', sup: [], lnk: ''},
            {hrd: false, ttl: 'Book Publications', sup: [], lnk: ''}
        ]
    },  
    {main: "Placement", cod:[0, 4], cols: 1, sub: [
        {hrd: false, ttl: 'About Placement Department', sup: [], lnk: '/abtplace'}, 
        {hrd: false, ttl: 'Placement Team', sup: [], lnk: '/place-team'}, 
        {hrd: false, ttl: 'Placement Details', sup: [], lnk: '/place-dep'},
        {hrd: false, ttl: 'Our Proud Alumni', sup: [], lnk: '/proudalumni'}

    ]}, 

]


const hdrs = [
  "velammal@velammal.edu.in", "+91 99566 00420", "NBA", "NAAC", "NIRF",
  "IIC", "Incubation Cell", "Alumni", "NSS", "NCC", "YRC",
  "Sports", "Transport", "Library", "Hostel", "Other Facilities"
];


return (
  <div>
    {/* Sidebar Open Button */}
    <button onClick={() => setIsOpen(true)} className={`fixed top-2 right-2 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-xl transition-all duration-300 ${isOpen ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}>
      <Bars3Icon className="w-7 h-7" />
    </button>

    {/* Background Overlay */}
    <motion.div className="fixed inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} onClick={() => setIsOpen(false)} style={{ pointerEvents: isOpen ? "auto" : "none" }} />

    {/* Sidebar */}
    <motion.div className="fixed top-0 right-0 h-full w-72 bg-gray-900 text-white shadow-2xl p-4 flex flex-col z-50" initial={{ x: "100%", opacity: 0.5, scale: 0.98 }} animate={{ x: isOpen ? 0 : "100%", opacity: isOpen ? 1 : 0.5, scale: isOpen ? 1 : 0.98 }} transition={{ ease: "easeInOut", duration: 0.45 }}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-2">
        {activeIndex !== null ? (
          <button onClick={() => {setActiveIndex(null); setTitle("")}} className="text-gray-400 hover:text-gray-200 transition flex items-center">
            <ChevronLeftIcon className="w-6 h-6" /> {title}
          </button>
        ) : (
          <h2 className="text-lg font-semibold">Navigation</h2>
        )}
        {!activeIndex && (
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200 transition">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="overflow-y-auto flex-1 mt-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {activeIndex === null ? (
          <ul className="space-y-2 list-none">
          {navs.map((nav, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.08, ease: "easeInOut" }}>
              <button onClick={() => setActiveIndex(i)} className="flex justify-between items-center w-full text-sm font-medium py-2 px-3 rounded-md bg-gray-800 hover:bg-gray-700 transition">
                {nav.main}
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </motion.li>
          ))}
        </ul>

        ) : (
          <div>
          <ul className="space-y-2 pl-4 border-l-2 border-gray-600/50">
            {navs[activeIndex].sub.map((sub, idx) => (
              <motion.li key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: idx * 0.08, ease: "easeInOut" }}>
                {sub.hrd ? (
                  <h3 className="text-sm font-semibold text-gray-200 mt-2">{sub.ttl}</h3>
                ) : (
                  <Link to={sub.lnk} className="block text-gray-400 hover:text-white transition-all py-2 px-3 rounded-md bg-gray-800/50 hover:bg-gray-700 backdrop-blur-md shadow-sm border border-gray-700/30" onClick={() => { 
                    setIsOpen(false); 
                  }}>
                    {sub.ttl}
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
          </div>
        )}
      </div>
      {/* Footer Section */}
      <div className="border-t border-gray-700 mt-2 pt-2">
        <div className="flex flex-col space-y-1 text-gray-400 text-xs">
          <div className="flex items-center gap-2">
            <p className="truncate">{hdrs[0]}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>{hdrs[1]}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-300">
          {hdrs.slice(2).map((item, index) => (
            <motion.button
              key={index}
              onClick={() => navigate(`/${item.toLowerCase().replace(/\s+/g, "-")}`)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md transition text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05, ease: "easeInOut" }}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Social Media Links */}
      <div className="mt-2 flex justify-center space-x-4">
        {socls.map((social, index) => (
          <a key={index} href={social.Link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition">
          <img src={social.Ico} alt={social.Name} className={`w-3 h-3 ${social.Fltr} filter brightness-0 invert`} />
          </a>
        ))}
      </div>
    </motion.div>
  </div>
);
};

export default Sidebar;