import { motion } from "framer-motion";
import LoadComp from "../../LoadComp";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const LIBFacl = ({faculty}) => {
  return (

    <>
    {Array.isArray(faculty) && (
      <>
      
          {faculty ? (

        <div className="py-16 px-6 font-[Poppins]">
          <h2 className="text-4xl font-bold text-accn dark:text-drkt mb-4 text-center">
            Staff
          </h2>

          {faculty?.description && (
            <div className="lg:text-center text-justify text-lg text-text dark:text-drkt w-5xl mx-auto mb-10">
              {faculty.description}
            </div>
          )}

          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {faculty?.map((fac, index) => (
              <motion.div
                key={index}
                className="relative rounded-2xl shadow-lg overflow-hidden transform transition-transform bg-[#d9d9d9]
                dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] hover:scale-105 border-2 "
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="">
                  <img
                    src={UrlParser(fac.image)}
                    alt={fac.name}
                    className="w-[55%] mt-4 h-44 m-auto object-cover filter brightness-90  rounded-xl group-hover:brightness-100 transition-all"
                  />
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-[18px] font-bold">{fac.name}</h3>
                  <p className="mt-2 text-brwn dark:text-drka">{fac.educational_qualification}</p>
                  <p className="text-accn dark:text-drka font-semibold mt-2">
                    {fac.designation}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
          ) : (
            <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
              <LoadComp />
            </div>
          )}
      </>
    )}
    </>
  );
};

export default LIBFacl;
