  import "./aboutHost.css"
  import hostel from'../../Assets/hostel.jpg';


  export default function AboutHostel () {
      return (
          <>

       <section className="about-hostel w-full max-w-7xl mx-auto p-4">
  <h2 className="about-hostel-heading text-center text-2xl font-bold mb-4 text-brwn dark:text-drkt">About Our Hostel</h2>

  <div className="hostel-abt-container flex flex-col md:flex-row items-center justify-center gap-6">
    <p className="hostel-about-para text-justify border-l-4 border-secd dark:border-drks p-4 rounded-md md:w-1/2 w-full dark:bg-drkb">
      Our college hostel provides a safe, clean, and welcoming environment that supports students’ a
      cademic and personal growth. It features spacious, well-ventilated rooms, clean washrooms, uninterrupted 
      water supply, high-speed internet, and common study and recreation areas. The hostel mess serves fresh, hygienic, 
      and nutritious meals prepared under strict quality standards, catering to both vegetarian and non-vegetarian 
      preferences. Regular menu rotations and feedback systems ensure variety and student satisfaction. The facility is managed 
      by experienced wardens and support staff, with 24/7 security to ensure safety. The hostel promotes discipline, responsibility, 
      and a sense of community, making it a true home away from home.
    </p>

    <div className="hostel-about-image md:w-1/2 w-full flex justify-center">
      <img src={hostel} alt="hostel" className="w-full max-w-xs md:max-w-md object-cover rounded" />
    </div>
  </div>
</section>

          </>
      )
  }