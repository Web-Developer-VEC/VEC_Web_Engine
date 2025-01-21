import React, { useEffect } from 'react';
import ScrollPages from './ScrollPages';
import { Users } from 'lucide-react';

import './Trust.css'

const Trust = () => {
  useEffect(() => {
    const pages = document.getElementById('all-pages');
    if (!pages) return;
    
    const pageCount = pages.querySelectorAll('.page').length;
    const s = new ScrollPages(1, pageCount, pages);
    s.init();

    return () => {
      s.destroy();
    };
  }, []);

  return (
    <div className="fullscreen-container">
      <div id="all-pages">
        <section className="page">
          <div className="text-container">
            <Users style={{ width: '64px', height: '64px', margin: '0 auto 24px', color: 'white' }} />
            <h2>Velammal Educational Trust (VET)</h2>
            <p>
              The year was 1986... The seed of social consciousness that his mother Smt.Velammal had sown in the mind of 
              Shri. M.V Muthuramalingam, Founder Chairman of Velammal Educational Trust, when he was of impressionable age, 
              was now germinating and sprouting the outcome - establishing Velammal Matriculation School at Chennai with a 
              strength of only 183 students and 13 staff members.
            </p>
            <p>
              From a small school at Mugappair in Chennai, the Velammal Group of institutions has spread to the districts 
              of Thiruvallur, Kancheepuram, Sivagangai, Madurai, Theni, Karur, Thiruvanamalai, Thanjavur, and Vellore 
              in Tamil Nadu. Now this group holds more than a lakh students and around 12000 staff members under its umbrella.
            </p>
          </div>
        </section>

        <section className="page">
          <div className="text-container">
            <div className="strength">
              <div className="text-area">
                <h2>Strength of the Trust</h2>
                <h6 className="highlight">
                  Inspiration is like a spark. It can light the whole city. One frail lady with strong conviction has 
                  motivated thousands of others to have good education and be proud citizens.
                </h6>
                <p>
                  A very humble, rustic lady with rural background and an unassuming attitude was how one described 
                  Smt. Velammal when they met her for the first time. But this frail lady, with her conviction and 
                  determination inspired the society and transformed it through her devoted son, Shri M.V.Muthuramalingam.
                </p>
                <p>
                  Her Philosophy was quite simple, She used to say, "You take care of the society and the society will 
                  reciprocate. You are not in isolation nor is your family. It is all a part of the society and the 
                  growth is interdependent".
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="page">
          <div className="text-container">
            <h2>The Management</h2>
            <div className="management-grid">
              <div className="management-card chairman">
                <img
                  src="/Images/muthu.png"
                  alt="Chairman"
                />
                <h5>Shri.M.V. Muthuramalingam</h5>
                <h6>Chairman</h6>
                <p>Velammal Educational Trust</p>
              </div>

              <div className="management-grid-row">
                <div className="management-card">
                  <img
                    src="/Images/velmoha.png"
                    alt="CEO"
                  />
                  <h5>Shri.M.V. VelMohan</h5>
                  <h6>Chief Executive Officer</h6>
                  <p>Velammal Educational Trust</p>
                </div>

                <div className="management-card">
                  <img
                    src="/Images/velmuruga.png"
                    alt="Correspondent"
                  />
                  <h5>Shri.M.V. VelMurugan</h5>
                  <h6>Correspondent</h6>
                  <p>Velammal Educational Trust</p>
                </div>

                <div className="management-card">
                  <img
                    src="'/Images/sasi.png'"
                    alt="Director"
                  />
                  <h5>Shri.M.V. Sasi Kumar</h5>
                  <h6>Director</h6>
                  <p>Velammal Educational Trust</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Trust;