import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Banner from '../../Banner';
import './Trust.css'
import LoadComp from '../../LoadComp';

const NewTrust = ({theme, toggle}) => {

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
      };
  }, []);

  if (!isOnline) {
      return (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp txt={"You are offline"} />
        </div>
      );
  }

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  const managementTeam = [
    {
      name: 'Shri. M.V. Muthuramalingam',
      role: 'Chairman',
      img: 'static/images/trust/muthuramalingam.webp',
    },
    {
      name: 'Shri. M.V. VelMurugan',
      role: 'Chief Executive Officer',
      img: 'static/images/trust/velmurugan.webp',
    },
    {
      name: 'Shri. M.V. VelMurugan',
      role: 'Deputy CEO',
      img: 'static/images/trust/deptyceo.webp',
    },
  ];

  return (
    <>
<Banner toggle={toggle} theme={theme}
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="Velammal Educational Trust"
  subHeaderText=" Transforming dreams into reality through a strong foundation of learning, leadership, and innovation."
/>

      <div className="bg-prim dark:bg-drkp min-h-screen">

        <div className="mt-12 container1 text-text dark:text-drkt mx-auto px-6">
        <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left text-text dark:text-drkt"
            >
              <h2 className="text-3xl font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
              Velammal Educational Trust (VET)
              </h2>
              <p className="text-lg leading-relaxed">
              In the year 1986... Smt.Velammal had sown the seed of social consciousness  in the mind of her son Shri. M.V Muthuramalingam, Founder Chairman of Velammal Educational Trust, at his impressionable age, which started germinating and sprouting the outcome - establishing Velammal Matriculation School at Chennai with a strength of only 183 students and 13 staff members.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
              From a small school at Mugappair in Chennai, to an established educational brand of Tamilnadu. The Velammal Group of institutions has spread to the districts of Thiruvallur, Kancheepuram, Sivagangai, Madurai, Theni, Karur, Thiruvanamalai, Thanjavur, and Vellore. Now this group holds more than a lakh students and around 12000 staff members under its umbrella.       
</p>
</motion.div>
          <div className="mt-10 grid md:grid-cols-2 gap-8 items-center ">
            {/* Image Section */}
            <motion.div
              whileHover={{  }}
              className="flex justify-center group overflow-hiaccn rounded-2xl saadow-lg"
            >
              <img
                className="w-64 h-max object-cover transition-transform duration-500 "
                src={UrlParser('static/images/trust/velammal.webp')}
                alt="Velammal Trust Banner"
              />
            </motion.div>

            {/* Text Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left text-text dark:text-drkt"
            >
              <h2 className="text-3xl font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
                Strength of the Trust
              </h2>
              {/* <p className="text-lg leading-relaxed">
              Inspiration is like a spark. It can light the whole city. One frail lady with strong conviction has motivated thousands of others to have good education and be proud citizens.
A very humble, rustic lady with rural background and an unassuming attitude was how one described Smt. Velammal when they met her for the first time. But this frail lady, with her conviction and determination inspired the society and transformed it through her devoted son, Shri M.V.Muthuramalingam.
              </p> */}
              <p className="text-lg leading-relaxed">
              Her Philosophy was quite simple, She used to say, "You take care of the society and the society will reciprocate. You are not in isolation nor is your family. It is all a part of the society and the growth is interdependent".              </p>
            </motion.div>
          </div>


        </div>
        {/* Section 3 - Management */}
        <div className="mt-16 py-12 px-6 rounded-t-3xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-accn dark:text-drka mb-6">The Management</h2>
          </div>
          <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-10 justify-evenly">
            {/* {managementTeam.map((person, index) => ( */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                          dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                          text-text dark:text-drkt p-6 rounded-lg shadow-md 
                          hover:shadow-xl transition-shadow duration-300 md:flex"
              >
                <img
                  src={UrlParser("static/images/trust/muthuramalingam.webp")}
                  alt="Shri. M.V. Muthuramalingam"
                  className="management-image-1 md:w-40 md:h-40 mr-6 shadow-lg"
                />

                <div>
                  <h5 className="text-sm font-bold">Shri. M.V. Muthuramalingam</h5>
                  <h6 className="text-sm text-accn dark:text-drka">Chairman</h6>
                  <p className="mt-2">Velammal Educational Trust</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                          dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                          text-text dark:text-drkt p-6 rounded-lg shadow-md 
                          hover:shadow-xl transition-shadow duration-300 md:flex"
              >
                <img
                  src={UrlParser('static/images/trust/velmurugan.webp')}
                  alt="Shri. M.V. VelMurugan"
                  className="management-image-2 md:w-40 md:h-40 mr-6 shadow-lg"
                />

                <div>
                  <h5 className="text-sm font-bold">Shri. M.V. VelMurugan</h5>
                  <h6 className="text-sm text-accn dark:text-drka">Chief Executive Officer</h6>
                  <p className="mt-2">Velammal Educational Trust</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                          dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                          text-text dark:text-drkt p-6 rounded-lg shadow-md 
                          hover:shadow-xl transition-shadow duration-300 md:flex"
              >
                <img
                  src={UrlParser("static/images/trust/deptyceo.webp")}
                  alt="Shri. M.V. VelMurugan"
                  className="management-image-3 md:w-40 md:h-40 mr-6 shadow-lg"
                />

                <div>
                  <h5 className="text-sm font-bold">Shri. V. Karthik Velmurugan</h5>
                  <h6 className="text-sm text-accn dark:text-drka">Deputy CEO</h6>
                  <p className="mt-2">Velammal Educational Trust</p>
                </div>
              </motion.div>
            {/* ))} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewTrust;
