import React from 'react';
import Banner from '../Assets/smt_velammal.png';
import { Users } from 'lucide-react';
import './Trust.css';

const NewTrust = () => {
  const sec2Cnt =
    'Velammal Engineering College (Autonomous) is affiliated to Anna University and is approved by the All India Council for Technical Education (AICTE). The institution was certified ISO 9001:2015 by M/s. TUV NORD, Germany, in just 5 years of its inception. The college is accredited by NAAC and all the UG programmes are accredited by NBA. Based in Chennai city, VEC, the safe campus, offers a truly unrivalled study experience with various courses, outstanding facilities, comprehensive support and highly disciplined life. ';

  return (
    <div>
      {/* Section 1 */}
      <div className="flex mt-2 gap-8 bg-gradient-to-r from-[#fffbea] to-[#fef6d9] border-y-4 border-amber-400 p-10 shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300 ease-in-out">
        <div className="flex flex-col justify-center">
          <p className="text-2xl font-semibold text-gray-800 font-popp leading-relaxed tracking-wide">
            <div className="text-container">
              <Users style={{ width: '64px', height: '64px', margin: '0 auto 24px', color: 'white' }} />
              <h2 style={{ textAlign: 'center', borderBottom: '2px solid black', marginBottom: '30px' }}>
                Velammal Educational Trust (VET)
              </h2>
              <p>
                The year was 1986... The seed of social consciousness that his mother Smt.Velammal had sown in the mind of Shri. M.V Muthuramalingam, Founder Chairman of Velammal Educational Trust, when he was of impressionable age, was now germinating and sprouting the outcome - establishing Velammal Matriculation School at Chennai with a strength of only 183 students and 13 staff members.
              </p>
              <p>
                From a small school at Mugappair in Chennai, the Velammal Group of institutions has spread to the districts of Thiruvallur, Kancheepuram, Sivagangai, Madurai, Theni, Karur, Thiruvanamalai, Thanjavur, and Vellore in Tamil Nadu. Now this group holds more than a lakh students and around 12000 staff members under its umbrella.
              </p>
            </div>
          </p>
        </div>
      </div>

      {/* Section 2 - Banner with Strength of Trust */}
      <div className="mt-2  flex gap-8 bg-gradient-to-r from-[#fffbea] to-[#fef6d9] border-y-4 mb- border-amber-400 p-10 shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300 ease-in-out">
        <div className="relative group min-h-[20vh] min-w-[20vw]">
          <img
            className="w-full h-full rounded-tl-[2rem] rounded-br-[2rem] object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            src={Banner}
            alt="Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 rounded-tl-[2rem] rounded-br-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="mb-3" style={{ textAlign: 'center', borderBottom: '2px solid black' }}>Strength of the Trust</h1>
          <p className="text-2xl font-semibold text-gray-800 font-popp leading-relaxed tracking-wide">
            <h6 className="highlight">
              Inspiration is like a spark. It can light the whole city. One frail lady with strong conviction has motivated thousands of others to have good education and be proud citizens.
            </h6>
            <p>
              A very humble, rustic lady with rural background and an unassuming attitude was how one described Smt. Velammal when they met her for the first time. But this frail lady, with her conviction and determination inspired the society and transformed it through her devoted son, Shri M.V.Muthuramalingam.
            </p>
            <p>
              Her Philosophy was quite simple, She used to say, "You take care of the society and the society will reciprocate. You are not in isolation nor is your family. It is all a part of the society and the growth is interdependent".
            </p>
          </p>
        </div>
      </div>

      {/* Section 3 - Management Cards */}
      {/* Section 3 - Management Cards */}
<div className="text-container mt-7">
  <h2>The Management</h2>
  <div className="management-grid">
    {/* First Row: Chairman */}
    <div className="management-grid-row">
      <div className="management-card chairman">
        <img src="/Images/muthu.png" alt="Chairman" />
        <h5>Shri.M.V. Muthuramalingam</h5>
        <h6>Chairman</h6>
        <p>Velammal Educational Trust</p>
      </div>
    </div>

    {/* Second Row: CEO, Correspondent, and Director */}
    <div className="management-grid-row">
      <div className="management-card">
        <img src="/Images/velmoha.png" alt="CEO" />
        <h5>Shri.M.V. VelMohan</h5>
        <h6>Chief Executive Officer</h6>
        <p>Velammal Educational Trust</p>
      </div>

      <div className="management-card">
        <img src="/Images/velmuruga.png" alt="Correspondent" />
        <h5>Shri.M.V. VelMurugan</h5>
        <h6>Correspondent</h6>
        <p>Velammal Educational Trust</p>
      </div>

      <div className="management-card">
        <img src="/Images/sasi.png" alt="Director" />
        <h5>Shri.M.V. Sasi Kumar</h5>
        <h6>Director</h6>
        <p>Velammal Educational Trust</p>
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default NewTrust;
