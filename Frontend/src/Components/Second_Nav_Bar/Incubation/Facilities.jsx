
function FacilityCard({ image, title, desc }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg overflow-hidden transition-shadow">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {/* <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p> */}
      </div>
    </div>
  );
}

export default function facilities() {
  // Example facility data (you can fetch from API)
  const facilityList = [
    {
      image: "/robotics-lab.jpg",
      title: "Advanced Robotics Lab",
      desc: "Cutting-edge robotics systems and automation projects."
    },
    {
      image: "/workshop.jpg",
      title: "Innovation Workshop",
      desc: "A creative space for prototyping and building."
    },
    {
      image: "/iot-lab.jpg",
      title: "IoT Lab",
      desc: "Develop and test Internet of Things solutions."
    },
    {
      image: "/ai-lab.jpg",
      title: "AI Research Hub",
      desc: "Experiment with machine learning and AI tools."
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-[Poppins,sans-serif]">
      <section className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Explore Facilities</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilityList.map((f, idx) => (
            <FacilityCard key={idx} {...f} />
          ))}
        </div>
      </section>
    </div>
  );
}
