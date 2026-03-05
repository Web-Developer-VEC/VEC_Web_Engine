import { motion } from "framer-motion";

export function LIBMultimedia() {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <div className=" pt-16 pb-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Images */}
        <div className="relative group">
          <motion.img
            src={UrlParser(
              "/static/images/library/library_images/Multimedia+Library+1.webp",
            )}
            alt="Multimedia Library"
            className="w-full rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-105"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.img
            src={UrlParser(
              "/static/images/library/library_images/Multimedia+Library+2.webp",
            )}
            alt="Library Resources"
            className="absolute bottom-[-30px] right-[-20px] w-2/3 rounded-xl shadow-xl border-4 border-white transition-transform duration-500 group-hover:rotate-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>

        {/* Right Side - Text Content */}
        <motion.div
          className=""
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-6">
            MULTIMEDIA LIBRARY
          </h2>
          <p className="text-lg leading-relaxed text-justify">
            A separate Multimedia Library is provided to utilize CD-ROMs,
            Online Journals, and NPTEL courses. It offers internet browsing,
            enabling students and faculty to access multidisciplinary video
            learning materials.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-justify">
            Our college is a proud member of <strong>DELNET</strong>,
            promoting resource sharing among libraries. We provide access to
            online journals like IEEE Transactions, ASME Proceedings, and more
            for research activities.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-justify">
            The <strong>National Digital Library of India</strong> integrates
            global digital libraries under a single portal. It supports
            academic disciplines in multiple languages, making knowledge
            accessible for all.
          </p>
        </motion.div>
      </div>
    </div>
  );
}