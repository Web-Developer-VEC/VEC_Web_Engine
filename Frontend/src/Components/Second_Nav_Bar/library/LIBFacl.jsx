import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import LoadComp from "../../LoadComp";

const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

const LIBFacl = () => {
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/library");
        const data = res.data;

        const facultyData = data?.["faculty & Staff"] || data[0]?.["faculty & Staff"];
        setFaculty(facultyData);
        console.log("Faculty data loaded:", facultyData);
      } catch (error) {
        console.error("Error fetching faculty data:", error.message);
      }
    };

    fetchData();
  }, []);

  return (

    <>
      {faculty ? (

    <div className="py-16 px-6">
      <h2 className="text-4xl font-bold text-accn dark:text-drka mb-4 text-center">
        Faculty & Staff
      </h2>

      {faculty.description && (
        <div className="text-center text-lg text-gray-600 w-5xl mx-auto mb-10">
          {faculty.description}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {faculty?.name?.map((name, index) => (
          <motion.div
            key={index}
            className="relative rounded-2xl shadow-lg overflow-hidden transform transition-transform
            dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] hover:scale-105 border-2 border-[#800000]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="group relative">
              <img
                src={UrlParser(faculty?.image[index])}
                alt={name}
                className="w-full h-60 object-cover filter brightness-90 group-hover:brightness-100 transition-all"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <h3 className="text-xl font-bold text-white text-center px-4">
                  {name}
                </h3>
              </div>
            </div>

            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold">{name}</h3>
              <p className="mt-2">{faculty?.educational_qualification[index]}</p>
              <p className="text-accn dark:text-drka font-semibold mt-2">
                {faculty?.designation[index]}
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
  );
};

export default LIBFacl;
