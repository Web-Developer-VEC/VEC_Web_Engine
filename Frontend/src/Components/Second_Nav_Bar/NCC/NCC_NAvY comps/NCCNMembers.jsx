import React from "react";
import "./NCCNMembers.css";

const NCCNMembers = () => {
  const members = Array.from({ length: 60 }, (_, index) => ({
    id: index + 1,
    name: `Cadet ${index + 1}`,
    degree: "Dept. of Mechanical Engineering, Velammal Engineering college",
    image: "https://via.placeholder.com/150",
    description:
      "A dedicated cadet committed to leadership, discipline, and service to the nation.",
    platoon: "EME Platoon",
  }));

  return (
    <div className="membersnavy-ncca-members-container">
      <h2 className="membersnavy-h2">
        Meet Our Officer
        <div className="membersnavy-underline"></div>
      </h2>
      <div className="membersnavy-member-card-1">
        <img
          src="https://via.placeholder.com/150"
          alt="Officer"
          className="membersnavy-member-image"
        />
        <div className="membersnavy-member-info">
          <span className="membersnavy-platoon">Commanding Officer</span>
          <h3>John Doe</h3>
          <p className="membersnavy-title">Bachelor of Defense Studies</p>
          <p className="membersnavy-degree">
            A highly skilled and disciplined officer leading the cadets with
            excellence.
          </p>
        </div>
      </div>

      <h2 className="membersnavy-h2">
        Cadet Leaders
        <div className="membersnavy-underline"></div>
      </h2>
      <div className="membersnavy-members-grid">
        {members.map((member) => (
          <div key={member.id} className="membersnavy-member-card">
            <img
              src={member.image}
              alt={member.name}
              className="membersnavy-member-image"
            />
            <div className="membersnavy-member-info">
              <span className="membersnavy-platoon">{member.platoon}</span>
              <h3>{member.name}</h3>
              <p className="membersnavy-title">Student</p>
              <p className="membersnavy-degree">{member.degree}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NCCNMembers;
