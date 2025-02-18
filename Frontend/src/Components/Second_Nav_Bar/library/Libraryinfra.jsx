import React from "react";
import { motion } from "framer-motion";
import { Tilt } from "react-tilt";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState } from "react";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";const LibrarySections = () => {
  const sections = [
    {
      title: "The Ground Floor",
      items: [
        "Stack Room with Reading Hall",
        "Circulation Section",
        "Technical Section",
        "Reprography Section",
        "Book Bank Sections",
      ],
      image:
      "https://img.freepik.com/free-photo/young-student-learning-library_23-2149215402.jpg?t=st=1739021050~exp=1739024650~hmac=dc9d7849d845eae5961b643eeeef28f4b32e21e12bc11bd55bc07ed7ffc29258&w=900",
    },
    {
      title: "The First Floor",
      items: [
        "Periodical Section",
        "Reference Section",
        "Reading Hall",
        "Multimedia Library",
        "Internet / CD Browsing Section",
        "Audio / Video Section",
        "IEEE Students Branch",
        "Back Volumes",
        "Project Report",
      ],
      image:
      "https://img.freepik.com/premium-photo/row-bookshelves-filled-with-books_13339-21626.jpg?w=360",
    },
  ];

  const additionalSections = [
    {
      category: "SERVICES",
      items: [
        "Reference service",
        "Reservation Service",
        "Online Public Access Catalogue (OPAC)",
        "Internet Service",
        "Reprographic Service",
        "Job Opportunity Display",
        "Books exhibition",
        "SDI service",
        "Technical Film shows",
        "Current awareness Service",
      ],
    },
    {
      category: "FACILITIES",
      items: [
        "Inter Library Network",
        "OPAC (On-line Public Access Catalogue)",
        "Book Bank (SC/ST)",
        "General Book Bank",
        "Career Guidance Sections",
        "Reading Halls for Reference",
        "Web Based Library Information",
        "E-Resources Access",
      ],
    },
    {
      category: "E-RESOURCES",
      items: ["E-Journals", "E-books", "DELNET", "NPTEL", "NDL"],
    },
  ];
  
 
  const generalInstructions = [
    "Students can obtain membership cards by showing their ID cards with barcodes.",
    "Members should sign in at the entrance to accept library rules.",
    "Two renewals per book are allowed unless reserved by others.",
    "Users should verify book conditions before borrowing.",
    "Books must be returned on or before the due date.",
    "Late returns will incur overdue charges as per rules.",
    "Users should collect a receipt for any fines paid.",
    "Members can suggest new books to the librarian.",
    "Strict silence must be maintained in the library.",
  ];


  const members = [
    {
      id: 1,
      role: "Professors, Associate Professors and Assistant Professors",
      books: 8,
      extra: 1,
    },
    { id: 2, role: "JRF/Research Scholars", books: 6, extra: 1 },
    { id: 3, role: "UG Students", books: 6, extra: 1 },
    { id: 4, role: "PG Students", books: 6, extra: 1 },
    { id: 5, role: "Skilled Non-Teaching Staff", books: 3, extra: 1 },
  ];

  const images = [
    "/static/Images/ECE.jpeg",
    "/static/Images/EEE.jpeg",
    "/static/Images/EIE.jpeg",
  ];
  
  const librarySections = [
    {
      title: "ACQUISITION SECTION",
      description:
        "Acquisition Section is entrusted with the acquisition of all syllabus textbooks, reference books as prescribed in the course syllabus of Anna University for all UG and PG programmes. The Faculty can identify suitable books from other suppliers and once the books are identified to take care of their academic responsibilities (if the books are not available in the library). Once the books are identified, they obtain prior approval from principal through HODs against a books recommendation format through the librarian (to certify the non-availability of the books). Books are received from the supplier with the bills/invoice. They are verified for the title, author and edition, quantity, and any damages/missing pages. The bills are certified and forwarded to the account department for payment.",
      image: "https://img.freepik.com/free-photo/rows-bookshelves-with-books-college-library_23-2148199865.jpg?w=900",
    },
    {
      title: "TECHNICAL SECTION",
      description:
        "A spacious Technical Section with well-furnished furniture is provided to carry out the works such as books accessioning, classifying the books, preparation of data entry sheet, and other related technical works for newly purchased books and journals.",
      image: "https://img.freepik.com/free-photo/modern-bookshelves-library-interior_23-2149004811.jpg?w=900",
    },
  ];

const ImageGallery = [
    {
        title: "REPROGRAPHY SECTION",
        description:
          "The College Library is equipped with a plain paper copier for REPROGRAPHY SERVICE, enabling users to obtain photocopies of library documents at a nominal cost while preserving the collection.",
        image: "https://img.freepik.com/free-photo/copy-machine-office_23-2149175927.jpg?w=900",
      },
      {
        title: "STACK ROOM WITH READING HALL",
        description:
          "A well-equipped, multi-storied stock room with modern book stacks for easy access. Books are classified using the Universal Decimal Classification, and an Open Access System is followed.",
        image: "https://img.freepik.com/free-photo/library-with-books_23-2149063973.jpg?w=900",
      },
      {
        title: "READING HALL",
        description:
          "Designed to provide a wonderful reading atmosphere with comfortable tables and chairs for 250 users. Students can bring books and journals from stacks for reference work.",
        image: "https://img.freepik.com/free-photo/students-studying-library_23-2149060958.jpg?w=900",
      },
      {
        title: "PERIODICAL SECTION",
        description:
          "Contains technical and non-technical journals of national and international origins. Latest issues are displayed outside, while back volumes are stored for reference.",
        image: "https://img.freepik.com/free-photo/magazines-stack-table_23-2149061123.jpg?w=900",
      },
      {
        title: "REFERENCE SECTION",
        description:
          "Holds about 5000 reference books on Engineering, Science, Humanities, English, Encyclopedias & Dictionaries, including a collection of rare books.",
        image: "https://img.freepik.com/free-photo/library-bookshelves_23-2149061503.jpg?w=900",
      },
      {
        title: "PROJECT REPORT & BACK VOLUMES",
        description:
          "The Library houses 2768 journal back volumes covering Engineering, Science, Humanities, and Business, along with 3192 student project reports.",
        image: "https://img.freepik.com/free-photo/old-books-library_23-2149060835.jpg?w=900",
      },
];


    const NewArrivals = [
      {
        title: "NEW ARRIVALS - BOOKS/PERIODICALS",
        description:
          "New books are displayed in the new arrival rack for at least one week. Current periodicals are arranged subject-wise in racks until new issues arrive.",
        image: "https://velammal.edu.in/wp-content/uploads/2022/04/ieee.jpg",
      },
      {
        title: "IEEE STUDENT BRANCH LIBRARY",
        description:
          "The IEEE student branch is highly active, providing access to 50+ IEEE journals and transactions. All students and staff can reference these materials.",
        image: "https://velammal.edu.in/wp-content/uploads/2022/04/internet-cd.jpg",
      },
      {
        title: "INTERNET / CD BROWSING",
        description:
          "Apart from internet access in the computer lab, the library offers four computers for internet and CD browsing.",
        image: "https://velammal.edu.in/wp-content/uploads/2022/04/audio-video.jpg",
      },
      {
        title: "AUDIO VIDEO SECTION",
        description:
          "The library contains audio cassettes, video tapes, and CDs to enhance communication skills, subject knowledge, and competitive exam preparation.",
        image: "https://velammal.edu.in/wp-content/uploads/2022/04/internet-cd.jpg",
      },
    ];
  

    const facultyData = [
        {
          name: "Dr. S. Rajendraprasath",
          qualification: "B.Sc., M.A., M.L.I.Sc., M.Phil., Ph.D",
          role: "Librarian / HOD",
          image: "https://img.freepik.com/premium-photo/teachers-day-background_1031776-124413.jpg?w=740",
        },
        {
          name: "T. Senthivel",
          qualification: "M.A., M.L.I.Sc",
          role: "Library Assistant",
          image: "https://img.freepik.com/free-photo/pretty-young-student-with-big-glasses-near-some-books-smiling-white-background_231208-1850.jpg?t=st=1739025085~exp=1739028685~hmac=b350edd3bd799b8313f54047eec2a02ce617a1064c9df9c3313be13c9a7062ff&w=900",
        },
        {
          name: "P. Kumaravel",
          qualification: "B.A",
          role: "Library Assistant",
          image: "https://img.freepik.com/free-photo/businessman-black-suit-holding-his-tasklist-makes-thumb-up_114579-15902.jpg?t=st=1739025108~exp=1739028708~hmac=afb163cc96525657ca44165f580307ea0726251ce122f02d7cf5ba88e70f1eb4&w=900",
        },
      ];


      const Links = [
        {
          title: "Free E-Books Download Websites",
          content: [
            { name: "University of Pennsylvania", link: "http://digital.library.upenn.edu/books" },
            { name: "Project Gutenberg", link: "http://www.gutenberg.org" },
            { name: "Free e-books", link: "http://www.free-ebooks.net" },
            { name: "Free Tech Books", link: "http://www.freetechbooks.com" },
            { name: "Campus Books", link: "http://www.campusbooks.com" },
            { name: "University of Virginia e-Book Library", link: "http://etext.lib.virginia.edu/ebooks/ebooklist.html" },
            { name: "NAP Open Book", link: "http://www.nap.edu/index.html" },
            { name: "Internet Public Library", link: "http://www.ipl.org/div/books" },
            { name: "Direct Textbook", link: "http://www.directtextbook.com" },
            { name: "e-Books", link: "http://e-books.org" },
            { name: "e-Books Palace", link: "http://www.ebookpalace.com" },
            { name: "Electronic Library of Mathematics", link: "http://www.emis.de/journals/short_index.html" },
          ],
        },
        {
          title: "Anti-Plagiarism Scanner Software",
          content: [
            { name: "CopyCatch", link: "https://www.copycatchgold.com" },
            { name: "TurnItOut", link: "https://www.turnitout.com" },
            { name: "Eve", link: "https://www.canexus.com" },
            { name: "Plagiarism.com", link: "https://www.plagiarism.com" },
            { name: "Copyscape", link: "https://www.copyscape.com" },
            { name: "CodeMatch (CodeSuite)", link: "https://www.zeidmanconsulting.com/CodeSuite.htm" },
            { name: "ArticleChecker", link: "https://www.articlechecker.com" },
            { name: "PlagiarismDetect.com", link: "https://www.plagiarismdetect.com" },
            { name: "Duplichecker", link: "https://www.duplichecker.com" },
            { name: "Small SEO Tools", link: "https://smallseotools.com/plagiarism-checker/" },
            { name: "ScanMyEssay & Viper & WCopyFind", link: "https://www.scanmyessay.com/" },
          ],
        },
        {
          title: "Our Collections",
          content: [
            "Total Books: 77,525",
            "Total Titles: 25,156",
            "General Bank Books: 1,818",
            "SC/ST Book Bank Books: 984",
            "e-Books: 155",
            "Journals: 162 (75 International, 87 National)",
            "CDs: 3,930",
            "Video Cassettes: 127",
            "Journal Back Volumes: 2,768",
            "Student Project Reports: 3,192",
            "Online Journals Package: 9,517",
            "Magazines & Newspapers: 20",
          ],
        },
        {
          title: "Question Bank - UG Courses",
          content: [
            "B.E Computer Science & Engineering (CSE)",
            "B.E Electronics & Communication Engineering (ECE)",
            "B.E Electrical & Electronics Engineering (EEE)",
            "B.E Electronics & Instrumentation Engineering (E&I)",
            "B.Tech Information Technology (IT)",
            "B.E Mechanical Engineering (MECH)",
            "B.E Civil Engineering (CIVIL)",
            "B.E Automobile Engineering (AUTO)",
            "B.E Artificial Intelligence & Data Science (AI & DS)",
          ],
        },
        {
          title: "Question Bank - PG Courses",
          content: [
            "M.E Computer Science & Engineering (CSE)",
            "M.E Power Systems Engineering (PSE)",
            "Master of Business Administration (MBA)",
          ],
        },
      ];

      const [openSection, setOpenSection] = useState(null);

      const toggleSection = (index) => {
        setOpenSection(openSection === index ? null : index);
      };
    
  return (
    <>
<div className="min-h-screen bg-gradient-to-r from-yellow-50 to-white p-3 md:p-6 lg:p-10 space-y-8 md:space-y-12 lg:space-y-16">
  <div className="max-w-7xl mx-auto flex gap-4 justify-center">
    {sections.map((section, index) => (
      <motion.div
        key={index}
        className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileHover={{ rotate: 1 }}
      >
        <div className="w-full">
          <img
            src={section.image}
            alt={section.title}
            className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-5">
          <h2 className="text-xl sm:text-2xl font-semibold text-yellow-700">{section.title}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base text-gray-800">
            {section.items.map((item, i) => (
              <motion.li
                key={i}
                className="flex items-center space-x-2 hover:text-yellow-700 transition-colors duration-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: (i % 5) * 0.08 }}
                viewport={{ once: true }}
              >
                <span className="w-2 h-2 bg-yellow-700 rounded-full"></span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    ))}
  </div>

      {/* Additional Sections */}
{/* Additional Sections */}
<div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
  {additionalSections.map((section, index) => (
    <motion.div
      key={index}
      className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-md sm:shadow-lg text-center transition duration-500 hover:scale-105 hover:shadow-2xl hover:bg-yellow-50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600 mb-4 sm:mb-6">{section.category}</h2>
      <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg text-gray-800">
        {section.items.map((item, i) => (
          <motion.li
            key={i}
            className="flex items-center space-x-2 sm:space-x-3 hover:text-yellow-600 transition-colors duration-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-600 rounded-full"></span>
            <span className="text-start">{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  ))}
</div>


    </div>

    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white py-10 px-4 sm:px-6 flex flex-col items-center">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600 mb-6 sm:mb-10">GENERAL INSTRUCTIONS</h2>
  <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
    {generalInstructions.map((instruction, index) => (
      <motion.div
        key={index}
        className="relative bg-white rounded-lg shadow-md sm:shadow-lg p-4 sm:p-6 flex items-center cursor-pointer transition-all duration-500 hover:bg-yellow-100"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-yellow-600 text-white font-bold rounded-full text-sm sm:text-lg transition-transform duration-500">{index + 1}</span>
          <p className="text-sm sm:text-base md:text-lg text-gray-800">{instruction}</p>
        </div>
      </motion.div>
    ))}
  </div>
</div>

<div className="mx-auto p-4 sm:p-6">
  <h2 className="text-2xl sm:text-3xl font-bold text-center text-yellow-600 mb-4 sm:mb-6">
    MEMBERSHIP DETAILS
  </h2>
  <motion.div
    className="overflow-hidden rounded-2xl shadow-lg"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    {/* 🚀 Full-width Scrollable Wrapper for Mobile */}
    <div className="w-full overflow-x-auto">
      <div className="min-w-[750px] inline-block">
        <table className="w-full border-collapse bg-white/30 backdrop-blur-lg shadow-xl">
          <thead>
            <tr className="bg-yellow-600 text-white text-sm sm:text-base">
              <th className="py-2 px-3 sm:py-3 sm:px-6">S. No</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6">Member Details</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6">No. of Books</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6">Periodical/Back Volume/CD</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <motion.tr
                key={member.id}
                className="border-b border-gray-300 bg-white/40 transition-all duration-300 hover:bg-white"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-semibold text-gray-800">
                  {member.id}
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6 text-center text-gray-800">
                  {member.role}
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-semibold text-gray-900">
                  {member.books}
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-semibold text-gray-900">
                  {member.extra}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </motion.div>
</div>




    <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row items-center gap-12">
      {/* Carousel */}
      <motion.div
        className="w-full lg:w-1/2 overflow-hidden rounded-xl shadow-lg"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Carousel
          showThumbs={false}
          autoPlay
          infiniteLoop
          showArrows={false}
          showStatus={false}
          interval={3000}
          className="rounded-xl"
        >
          {images.map((src, index) => (
            <div key={index}>
              <img src={src} alt={`Library ${index + 1}`} className="rounded-xl" />
            </div>
          ))}
        </Carousel>
      </motion.div>

      {/* Text */}
      <motion.div
        className="w-full lg:w-1/2 space-y-4 bg-white/30 backdrop-blur-lg p-6 rounded-xl shadow-xl"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-yellow-600">BORROWING AND CIRCULATION</h2>
        <p className="text-gray-800 text-lg">
          The Circulation Section consists of five computers with barcode scanners for issue, return, 
          and renewal of books. All the library transactions are computerized. Enquiries regarding 
          availability of books, CDs, journals, and reservation of books are made in the circulation section.
        </p>
      </motion.div>
    </div>


    <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-white py-12 sm:py-16 px-4 sm:px-6 space-y-12 sm:space-y-16">
  <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-yellow-700 uppercase tracking-wide">
    Library Sections
  </h2>

  <div className="max-w-6xl mx-auto space-y-12">
  {librarySections.map((section, index) => (
    <motion.div
      key={index}
      className={`flex md:flex-row items-center gap-12 ${
        index % 2 === 0 ? "md:flex-row-reverse" : ""
      }`}
      initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Image Section */}
      <motion.div
        className="w-full md:w-1/2 h-full overflow-hidden rounded-3xl shadow-lg"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={section.image}
          alt={section.title}
          className="w-full h-80 object-cover rounded-3xl"
        />
      </motion.div>

      {/* Text Content */}
      <div className="w-full md:w-1/2 h-full p-6 bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg flex flex-col justify-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-yellow-700">{section.title}</h3>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-800 leading-relaxed">
          {section.description}
        </p>
      </div>
    </motion.div>
  ))}
</div>

</div>

<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-12 sm:py-16 px-4 sm:px-6">
  <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-yellow-700 uppercase tracking-wide mb-8 sm:mb-12">
    Library Highlights
  </h2>

  <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
    {ImageGallery.map((section, index) => (
      <motion.div
        key={index}
        className="relative group"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <Tilt
          options={{ max: 15, scale: 1.05, speed: 400, glare: true, "max-glare": 0.2 }}
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all transform group-hover:shadow-2xl"
        >
          <div className="relative overflow-hidden">
            <img
              src={section.image}
              alt={section.title}
              className="w-full h-56 sm:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-10 transition-opacity"></div>
          </div>

          <div className="p-5 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-yellow-700 group-hover:text-yellow-800 transition-colors">
              {section.title}
            </h3>
            <p className="mt-2 sm:mt-3 text-gray-700 leading-relaxed">
              {section.description}
            </p>
          </div>
        </Tilt>
      </motion.div>
    ))}
  </div>
</div>


    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Images */}
        <div className="relative group">
          <motion.img
            src="https://img.freepik.com/free-photo/medium-shot-side-view-young-man-looking-vinyls-store_23-2148237252.jpg?t=st=1739024616~exp=1739028216~hmac=05bbcb6007c32216caba492b016231cb8228fcbf5f7b299540dfcd369d28f235&w=900"
            alt="Multimedia Library"
            className="w-full rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-105"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.img
            src="https://img.freepik.com/free-photo/beautiful-girl-picking-literature_23-2147678841.jpg?t=st=1739024663~exp=1739028263~hmac=eaad9cec0031ba51173f59ed052e30b3e6fae287eaa408b21b09867880db6778&w=900"
            alt="Library Resources"
            className="absolute bottom-[-30px] right-[-20px] w-2/3 rounded-xl shadow-xl border-4 border-white transition-transform duration-500 group-hover:rotate-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>

        {/* Right Side - Text Content */}
        <motion.div
          className="text-gray-800"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="text-4xl font-bold text-yellow-700 mb-6">
            MULTIMEDIA LIBRARY
          </h2>
          <p className="text-lg leading-relaxed">
            A separate Multimedia Library is provided to utilize CD-ROMs, Online Journals, 
            and NPTEL courses. It offers internet browsing, enabling students and faculty 
            to access multidisciplinary video learning materials.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            Our college is a proud member of <strong>DELNET</strong>, promoting resource sharing 
            among libraries. We provide access to online journals like IEEE Transactions, 
            ASME Proceedings, and more for research activities.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            The <strong>National Digital Library of India</strong> integrates global digital 
            libraries under a single portal. It supports academic disciplines in multiple 
            languages, making knowledge accessible for all.
          </p>
        </motion.div>
      </div>
    </div>


    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <h2 className="text-4xl font-bold text-yellow-600 mb-12 text-center">
        NEW ARRIVALS
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
        {NewArrivals.map((section, index) => (
          <motion.div
            key={index}
            className="relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="group relative">
              <img
                src={section.image}
                alt={section.title}
                className="w-full h-60 object-cover filter brightness-90 group-hover:brightness-100 transition-all"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <h3 className="text-2xl font-bold text-white text-center px-4">
                  {section.title}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">{section.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <h2 className="text-4xl font-bold text-yellow-600 mb-12 text-center">
        Faculty & Staff
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {facultyData.map((faculty, index) => (
          <motion.div
            key={index}
            className="relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="group relative">
              <img
                src={faculty.image}
                alt={faculty.name}
                className="w-full h-60 object-cover filter brightness-90 group-hover:brightness-100 transition-all"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <h3 className="text-xl font-bold text-white text-center px-4">
                  {faculty.name}
                </h3>
              </div>
            </div>

            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-900">{faculty.name}</h3>
              <p className="text-gray-600 mt-2">{faculty.qualification}</p>
              <p className="text-yellow-700 font-semibold mt-2">{faculty.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>



    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <h2 className="text-4xl font-bold text-yellow-600 mb-12 text-center">
        Library Resources
      </h2>

      <div className="max-w-4xl mx-auto space-y-6">
        {Links.map((section, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg">
            <button
              onClick={() => toggleSection(index)}
              className="w-full flex justify-between items-center px-6 py-4 text-xl font-semibold text-gray-800 bg-yellow-100 hover:bg-yellow-200 transition-all rounded-t-2xl"
            >
              {section.title}
              {openSection === index ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {openSection === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4 text-gray-700"
              >
                {Array.isArray(section.content) ? (
                  <ul className="list-disc pl-6 space-y-2">
                    {section.content.map((item, idx) =>
                      typeof item === "string" ? (
                        <li key={idx}>{item}</li>
                      ) : (
                        <li key={idx}>
                          <a href={item.link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            {item.name}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>{section.content}</p>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
</>
  );
};

export default LibrarySections;

