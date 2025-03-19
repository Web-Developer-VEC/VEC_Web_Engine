import React from "react";
import "./NCCAMenbers.css";

const NCCAMembers = () => {
  const members = Array.from({ length: 60 }, (_, index) => ({
    id: index + 1,
    name: `Cadet ${index + 1}`,
    degree: "Dept. of Mechanical Engineering",
    image: "https://via.placeholder.com/150",
    description:
      "A dedicated cadet committed to leadership, discipline, and service to the nation.",
    platoon: "EME Platoon",
  }));

  return (
    <div className="membersarmy-ncca-members-container">
      <h2 className="membersarmy-h2">
        Meet Our Officer
        <div className="membersarmy-underline"></div>
      </h2>
      <div className="membersarmy-member-card-1">
        <img
          src="https://via.placeholder.com/150"
          alt="Officer"
          className="membersarmy-member-image"
        />
        <div className="membersarmy-member-info">
          <span className="membersarmy-platoon">Commanding Officer</span>
          <h3>John Doe</h3>
          <p className="membersarmy-title">Bachelor of Defense Studies</p>
          <p className="membersarmy-degree">
            A highly skilled and disciplined officer leading the cadets with
            excellence.
          </p>
        </div>
      </div>

      <h2 className="membersarmy-h2">
        Cadet Leaders
        <div className="membersarmy-underline"></div>
      </h2>
      <div className="membersarmy-members-grid">
        {members.map((member) => (
          <div key={member.id} className="membersarmy-member-card">
            <img
              src={member.image}
              alt={member.name}
              className="membersarmy-member-image"
            />
            <div className="membersarmy-member-info">
              <span className="membersarmy-platoon">{member.platoon}</span>
              <h3>{member.name}</h3>
              <p className="membersarmy-title">Student</p>
              <p className="membersarmy-degree">{member.degree}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NCCAMembers;
