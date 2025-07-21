export default function Gallerydetails() {
  const galleryItems = [
    { id: 1, title: "Image 1", src: "https://tse3.mm.bing.net/th/id/OIP.nyLAzWYdvc-wb9ntq1cU7QHaHa?pid=Api&P=0&h=220https://tse3.mm.bing.net/th/id/OIP.nyLAzWYdvc-wb9ntq1cU7QHaHa?pid=Api&P=0&h=220" },
    { id: 2, title: "Image 2", src: "https://via.placeholder.com/150" },
    { id: 3, title: "Image 3", src: "https://tse3.mm.bing.net/th/id/OIP.Nzs2VOi9fkO4yYH3bygC0wHaDt?pid=Api&P=0&h=220" },
    { id: 4, title: "Image 4", src: "https://wallpaperaccess.com/full/4723250.jpg" },
    { id: 5, title: "Image 5", src: "https://via.placeholder.com/150" },
    { id: 6, title: "Image 6", src: "https://via.placeholder.com/150" },
    { id: 7, title: "Image 3", src: "https://tse3.mm.bing.net/th/id/OIP.Nzs2VOi9fkO4yYH3bygC0wHaDt?pid=Api&P=0&h=220" },
    { id: 8, title: "Image 4", src: "https://wallpaperaccess.com/full/4723250.jpg" },
    { id: 9, title: "Image 5", src: "https://via.placeholder.com/150" },
    { id: 10, title: "Image 6", src: "https://via.placeholder.com/150" },
  ];

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Gallery Page</h2>
      <div className="gallery-gri">
        {galleryItems.map((item) => (
          <div key={item.id} className="gallery-item">
            <img src={item.src} alt={item.title} />
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
