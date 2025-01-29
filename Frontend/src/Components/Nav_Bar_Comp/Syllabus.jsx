// Syllabus.jsx
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, BookOpen } from "lucide-react"
import "./Syllabi.css"

// Simple Banner component
const Banner = ({ title, description, backgroundImage }) => (
  <div
    className="banner h-64 flex items-center justify-center text-white relative mb-12" // Added mb-12
    style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute inset-0 bg-black/50"></div>
    <div className="relative text-center p-4">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-lg">{description}</p>
    </div>
  </div>
)

// CourseCard component
const CourseCard = ({ course, onClick }) => (
  <motion.div className="course-card" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <button className="course-button" onClick={onClick}>
      <div className="course-content">
        <BookOpen className="course-icon" />
        <span className="font-semibold">{course.name}</span>
      </div>
    </button>
  </motion.div>
)
const syllabusData = [
  {
    year: "For the students admitted from 2023 - 2024",
    courses: [
      [
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
      ],
      // ... existing courses array
    ]
  },
  {
    year: "Verticals Offered",
    courses: [
      [
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
      ],
      // Add more course groups as needed
    ]
  },
  {
    year: "Verticals Offered",
    courses: [
      [
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
      ],
      // Add more course groups as needed
    ]
  },
  {
    year: "For the students admitted from 2021 - 2022",
    courses: [
      [
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
        {
          name: "B.E. Civil Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
        {
          name: "B.E. Computer Science and Engineering",
          link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf",
        },
      ],
      
      // Add more course groups as needed
    ]
  }
];
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
}

function Syllabus() {
  const [selectedPdf, setSelectedPdf] = useState(null)

  return (
    <div className="min-h-screen bg-white mt-2">
      {" "}
      {/* Update 1 */}
      <Banner
        title="Course & Syllabus"
        description="Empowering students through structured learning and academic excellence"
        backgroundImage="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
      />
      {/* Updated container with shadow and spacing */}
      <div className="">
        {" "}
        {/* Update 2 */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-8">
          {syllabusData.map((section, index) => (
            <motion.div key={index} variants={itemVariants} className="">
              {/* Enhanced shadow */}
              <div className="groups bg-white rounded-lg overflow-hidden p-5">
                {" "}
                {/* Update 3 */}
                <div className="card p-8">
                  {" "}
                  {/* Increased padding */}
                  <div className="flex items-center gap-3 mb-4">
                    {" "}
                    {/* Increased spacing */}
                    <Calendar className="w-6 h-6" /> {/* Larger icon */}
                    <h2 className="text-2xl font-bold">{section.year}</h2> {/* Larger text */}
                  </div>
                 
                  <div className="course-grid flex items-center gap-1.3">
                    {" "}
                    {/* Increased grid gap */}
                    {section.courses.flat().map((course, courseIndex) => (
                      <CourseCard key={courseIndex} course={course} onClick={() => setSelectedPdf(course.link)} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedPdf && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center mt-20  z-50 h-100">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="bg-white rounded-lg p-6 w-full max-w-4xl"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Syllabus Viewer</h2>
                <button onClick={() => setSelectedPdf(null)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div className="pdf-viewer-container h-[65vh]">
                <iframe src={selectedPdf} title="PDF Viewer" className="w-full h-full border rounded" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default Syllabus

