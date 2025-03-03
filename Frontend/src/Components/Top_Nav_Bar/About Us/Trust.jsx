import React from 'react';
import { motion } from 'framer-motion';
import Banner from '../../Banner';
import './Trust.css'

const NewTrust = ({theme, toggle}) => {
  const managementTeam = [
    {
      name: 'Shri. M.V. Muthuramalingam',
      role: 'Chairman',
      img: '/Images/muthu.png',
    },
    {
      name: 'Shri. M.V. VelMohan',
      role: 'Chief Executive Officer',
      img: '/Images/velmoha.png',
    },
    {
      name: 'Shri. M.V. VelMurugan',
      role: 'Correspondent',
      img: '/Images/velmuruga.png',
    },
    {
      name: 'Shri. M.V. Sasi Kumar',
      role: 'Director',
      img: '/Images/sasi.png',
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
              The year was 1986... The seed of social consciousness that his mother Smt.Velammal had sown in the mind of Shri. M.V Muthuramalingam, Founder Chairman of Velammal Educational Trust, when he was of impressionable age, was now germinating and sprouting the outcome - establishing Velammal Matriculation School at Chennai with a strength of only 183 students and 13 staff members.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
              From a small school at Mugappair in Chennai, the Velammal Group of institutions has spread to the districts of Thiruvallur, Kancheepuram, Sivagangai, Madurai, Theni, Karur, Thiruvanamalai, Thanjavur, and Vellore in Tamil Nadu. Now this group holds more than a lakh students and around 12000 staff members under its umbrella.       
</p>
</motion.div>
          <div className="grid md:grid-cols-2 gap-8 items-center ">
            {/* Image Section */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex justify-center group overflow-hiaccn rounded-2xl saadow-lg"
            >
              <img
                className="w-max h-max object-cover transition-transform duration-500 group-hover:scale-110"
                src="/smt_velammal.png"
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
              <p className="text-lg leading-relaxed">
              Inspiration is like a spark. It can light the whole city. One frail lady with strong conviction has motivated thousands of others to have good education and be proud citizens.
A very humble, rustic lady with rural background and an unassuming attitude was how one described Smt. Velammal when they met her for the first time. But this frail lady, with her conviction and determination inspired the society and transformed it through her devoted son, Shri M.V.Muthuramalingam.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
              Her Philosophy was quite simple, She used to say, "You take care of the society and the society will reciprocate. You are not in isolation nor is your family. It is all a part of the society and the growth is interdependent".              </p>
            </motion.div>
          </div>


        </div>
        {/* Section 3 - Management */}
        <div className="mt-16 py-12 px-6 rounded-t-3xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-accn dark:text-drka mb-6">The Management</h2>
          </div>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {managementTeam.map((person, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]
                    text-text dark:text-drkt p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={person.img}
                  alt={person.role}
                  className="w-24 h-24 mx-auto rounded-full mb-4 shadow-lg"
                />
                <h5 className="text-xl font-bold">
                  {person.name}
                </h5>
                <h6 className="text-sm text-accn dark:text-drka">{person.role}</h6>
                <p className="mt-2">Velammal Educational Trust</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewTrust;
