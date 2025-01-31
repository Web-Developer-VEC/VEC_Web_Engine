import { useEffect, useState } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, BookOpen } from "lucide-react"
import "./Syllabi.css"
import Banner from "../Banner"

// CourseCard component
const CourseCard = ({ course, onClick }) => (
  <motion.div className="course-card" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <button className="course-button" onClick={onClick}>
      <div className="course-content">
        <BookOpen className="course-icon" />
        <span className="font-semibold">{course}</span>
      </div>
    </button>
  </motion.div>
)

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
  const [curriculumData, setCurriculumData] = useState([])
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/curriculumandsyllabus`)
        console.log("API Response:", response.data) // Log the entire response
        setCurriculumData(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error.message)
        setLoading(true)
      }
    }
    fetchData()
  }, [])

  const getPdfPath = (year, department) => {
    const yearData = curriculumData.find((item) => Object.keys(item)[0] === year)
    if (yearData) {
      const yearContent = yearData[year][0]
      const departmentIndex = yearContent.department.indexOf(department)
      return yearContent.pdf_path[departmentIndex]
    }
    return null
  }

  const renderSection = (data, year) => (
    <motion.div key={year} variants={itemVariants} className="">
      <div className="groups bg-white rounded-lg overflow-hidden p-5">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 caledar" />
            <h2 className="text-2xl font-bold">{data.year}</h2>
          </div>
          <div className="course-grid flex items-center gap-1.3">
            {data.department.map((course, courseIndex) => (
              <CourseCard key={courseIndex} course={course} onClick={() => setSelectedPdf(getPdfPath(year, course))} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <>
      <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Course & Syllabus"
        subHeaderText="Empowering students through structured learning and academic excellence"
      />
      <div className="min-h-screen bg-white mt-2">
        <div className="">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-8">
            {isLoading ? (
              <div className="loading-screen">
                <div className="spinner"></div>
                  Loading...
              </div>
            ) : (
              curriculumData.map((yearData, index) => {
                console.log("Rendering yearData:", yearData) // Log each yearData object
                const year = Object.keys(yearData)[0]

                if (year === "_id") {
                  // Skip the _id field
                  return null
                } else if (year === "Verticals") {
                  console.log("Rendering Verticals:", yearData[year]) // Log Verticals data
                  return yearData[year].map((verticalData, vIndex) => renderSection(verticalData, `${year}-${vIndex}`))
                } else {
                  const data = yearData[year][0]
                  return renderSection(data, year)
                }
              })
            )}
          </motion.div>
        </div>
        {/* PDF Viewer Modal */}
        <AnimatePresence>
          {selectedPdf && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center mt-20 z-50 h-100">
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
    </>
  )
}

export default Syllabus

