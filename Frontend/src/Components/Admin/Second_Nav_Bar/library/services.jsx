import { Tilt } from "react-tilt";
import { motion } from "framer-motion";

export function LIBServices({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  if (!data || !Array.isArray(data)) return null;
  
  return (
    <>
      {/* ✅ First div: Services, Facilities, E-Resources */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
        {data
          ?.filter((section) => section.category !== "Image_Gallery")
          .map((section, index) => (
            <motion.div
              key={index}
              className="p-4 sm:p-6 md:p-8 rounded-2xl shadow-md sm:shadow-lg text-center dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                        transition duration-500 hover:scale-105 hover:shadow-2xl hover:bg-[color-mix(in_srgb,theme(colors.secd),transparent_85%)]
                        dark:hover:bg-[color-mix(in_srgb,theme(colors.drks),transparent_85%)]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-accn dark:text-drkt mb-4 sm:mb-6">
                {section.category}
              </h2>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg">
                {Array.isArray(section.content) &&
                  section.content.map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center space-x-2 sm:space-x-3 hover:text-accn dark:hover:text-drkt transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="w-2 h-2 sm:w-3 sm:h-3 bg-secd dark:bg-drks rounded-full"></span>
                      <span className="text-start">
                        {typeof item === "string" ? item : item.name}
                      </span>
                    </motion.li>
                  ))}
              </ul>
            </motion.div>
          ))}
      </div>

      {Array.isArray(
        data?.find((section) => section.category === "Image_Gallery")
          ?.content,
      ) &&
        data.find((section) => section.category === "Image_Gallery").content
          .length > 0 && (
          <div className="h-auto py-12 sm:py-16 px-4 sm:px-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-accn dark:text-drkt uppercase tracking-wide mb-8 sm:mb-12">
              Library Highlights
            </h2>

            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {data
                .find((section) => section.category === "Image_Gallery")
                .content.map((item, index) => (
                  <motion.div
                    key={index}
                    className="relative group"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.15,
                      ease: "easeOut",
                    }}
                    viewport={{ once: true }}
                  >
                    <Tilt
                      options={{
                        max: 15,
                        scale: 1.05,
                        speed: 400,
                        glare: true,
                        "max-glare": 0.2,
                      }}
                      className="relative rounded-2xl shadow-lg overflow-hidden transition-all transform dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] group-hover:shadow-2xl"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={UrlParser(item.image_path)}
                          alt={item.title}
                          className="w-full h-56 sm:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-10 transition-opacity"></div>
                      </div>

                      <div className="p-5 sm:p-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-accn dark:text-drkt group-hover:text-secd dark:group-hover:text-drks transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-2 sm:mt-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </Tilt>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
    </>
  );
}