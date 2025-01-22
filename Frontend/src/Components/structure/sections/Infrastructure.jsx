import React from "react";
import "./Infrastructure.scss";
import lab from '../../Assets/college.jpeg';

const cards = [
  {
    title: "Mech lab",
    copy: "The Mechanical Lab provides modern equipment for hands-on learning in design, manufacturing, and thermal engineering.",
    button: "About lab",
    imageUrl:
      "https://velammal.edu.in/wp-content/uploads/2021/09/vec-Fmhel-174-1.jpg",
  },
  {
    title: "Communication Lab",
    copy: "The Communication Lab enhances language and presentation skills using advanced audio-visual tools.",
    button: "About Trips",
    imageUrl:
    "https://velammal.edu.in/wp-content/uploads/2021/09/newimage-300x200.png",
  },
  {
    title: "Library",
    copy: "The library offers a vast collection of books, journals, and digital resources, fostering research and learning in a quiet, modern space.",
    button: "About library",
    imageUrl:
      "https://velammal.edu.in/wp-content/uploads/2021/09/DSC_0162-1.jpg",
  },
  {
    title: "Mechanical Cell",
    copy: "The Mechanical Block houses advanced labs, classrooms, and workshops, providing students with practical knowledge in manufacturing, and innovation.",
    button: "About Dept",
    imageUrl:
      "https://velammal.edu.in/wp-content/uploads/2021/09/DSC_0124-1.jpg",
  },    
  {
    title: "Mechanical Cell",
    copy: "The Mechanical Block houses advanced labs, classrooms, and workshops, providing students with practical knowledge in manufacturing, and innovation.",
    button: "About Dept",
    imageUrl:
      "https://velammal.edu.in/wp-content/uploads/2021/09/DSC_0124-1.jpg",
  },
  {
    title: "Library",
    copy: "The library offers a vast collection of books, journals, and digital resources, fostering research and learning in a quiet, modern space.",
    button: "About library",
    imageUrl:
      "https://velammal.edu.in/wp-content/uploads/2021/09/DSC_0162-1.jpg",
  },  
  {
    title: "Mech lab",
    copy: "The Mechanical Lab provides modern equipment for hands-on learning in design, manufacturing, and thermal engineering.",
    button: "About lab",
    imageUrl:
      "https://velammal.edu.in/wp-content/uploads/2021/09/vec-Fmhel-174-1.jpg",
  },
  {
    title: "Communication Lab",
    copy: "The Communication Lab enhances language and presentation skills using advanced audio-visual tools.",
    button: "About Trips",
    imageUrl:
    "https://velammal.edu.in/wp-content/uploads/2021/09/newimage-300x200.png",
  },
];

const Infrastructure = () => {
  return (
    <div>
      <section className='infra'>

        <h1>Infrastructure</h1>
        {/* <div class="text-container">
          <div class="text-heading">

              <p class="text-title">          <h1>Infrastructure</h1></p>
              <p class="text-author">Kumar</p>
          </div>
          <div class="text-blockWrapper">
              <p class="text-author"> State-of-the-Art Laboratories</p>
              <p class="text-paragraph">The college boasts state-of-the-art laboratories equipped with modern tools and technologies to facilitate hands-on learning. These labs are designed for various disciplines, including computer science, electronics, mechanical engineering, and biotechnology, ensuring students gain practical knowledge and industry-relevant skills.</p>

              <p class="text-author">Advanced Library Facilities</p>
              <p class="text-paragraph">The campus features a well-stocked library with an extensive collection of books, journals, research papers, and digital resources. It offers a quiet, comfortable environment for reading and research, complemented by access to online databases, e-books, and a digital learning hub.</p>

              <p class="text-author"> Spacious and Smart Classrooms</p>
              <p class="text-paragraph">Classrooms are spacious and equipped with smart boards, projectors, and interactive tools to create an engaging and modern learning environment. This technology-enhanced setup promotes active participation and collaborative learning.</p>

              <p class="text-author">Modern Auditorium and Seminar Halls</p>
              <p class="text-paragraph">The college infrastructure includes a modern auditorium and multiple seminar halls with cutting-edge audio-visual systems. These facilities are used for hosting conferences, guest lectures, cultural events, and workshops, providing a platform for intellectual and creative growth.</p>

              <p class="text-author">High-Speed Internet and IT Infrastructure</p>
              <p class="text-paragraph">The campus is equipped with high-speed internet connectivity and robust IT infrastructure to support digital learning and research activities. Wi-Fi is available across the campus, ensuring that students and faculty stay connected at all times.</p>

              <p class="text-author">Sports and Recreational Facilities</p>
              <p class="text-paragraph">Recognizing the importance of physical well-being, the college provides excellent sports and recreational facilities. Students have access to playgrounds, indoor game rooms, and fitness centers, encouraging a healthy balance between academics and extracurricular activities.</p>

              <p class="text-author">On-Campus Hostel and Dining</p>
              <p class="text-paragraph">For students from distant locations, the college offers well-maintained on-campus hostels with comfortable living spaces, 24/7 security, and hygienic dining facilities. The hostels are designed to create a homely environment, promoting a sense of community among students.</p>

              <p class="text-author">Green and Sustainable Campus</p>
              <p class="text-paragraph">The college is committed to sustainability, featuring a lush green campus with eco-friendly initiatives like rainwater harvesting, solar power generation, and waste management systems. This creates a serene and inspiring atmosphere conducive to learning and personal growth.</p>

            </div>
          <div class="text-footer">
              <p class="text-referenceInfo">These features collectively provide students with an enriching academic and personal development experience, preparing them for success in their future careers.</p>
          </div>
        </div>*/}
      </section> 

      <main className="page-content">
        {cards.map((card, index) => (
          <div
            className="card_infa"
            style={{
              backgroundImage: `url(${card.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="content">
              <h2 className="title">{card.title}</h2>
              <p className="copy">{card.copy}</p>
              <button className="btn">{card.button}</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Infrastructure;
