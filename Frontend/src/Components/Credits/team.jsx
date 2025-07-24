export default function TeamTol() {
  return (
    <div className="flex justify-center p-10 ">
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
        {/* 👉 Replace the src below with your team image */}
        <img
          src="https://www.thevintagenews.com/wp-content/uploads/sites/65/2017/09/108-640x335.jpg"
          alt="Our Team"
          className="w-full object-cover"
        />
        {/* Overlay description */}
        <div className="absolute bottom-0 w-full bg-black/60 text-white p-6">
          <h2 className="text-2xl font-bold">Our Amazing Team</h2>
          <p className="mt-2 text-sm md:text-base leading-snug">
            We are a passionate group of designers, developers, and innovators 
            working together to create world‑class products and experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
