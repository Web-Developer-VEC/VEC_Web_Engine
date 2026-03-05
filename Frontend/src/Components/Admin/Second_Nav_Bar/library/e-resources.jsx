import { motion } from "framer-motion";

export function LIBEresources({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  return (
    <>
      {Array.isArray(data) && (
        <div className="py-16 px-6">
          <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-12 text-center">
            NEW ARRIVALS
          </h2>

          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
            {data?.map((section, index) => (
              <motion.div
                key={index}
                className="relative rounded-2xl shadow-lg overflow-hidden transform transition-transform
                  dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] hover:scale-105"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="group relative">
                  <img
                    src={UrlParser(section.image_path)}
                    alt={section.title}
                    className="w-full h-60 object-cover filter brightness-90 group-hover:brightness-100 transition-all"
                  />
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0
                      group-hover:opacity-100 transition-all"
                  >
                    <h3 className="text-2xl text-black font-bold text-center px-4">
                      {section.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="leading-relaxed">{section.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}