import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Conference.css';

const cards = [
  {
    id: 1,
    title: "Identification of Plant Disease using Machine Learning Algorithm",
    Name: "Ms.P.V.Raja Suganya",
    Conference: "4th International conference on inventive computation and information technology ",
    Type: "International",
    Organizer: "RVS Technical Campus, Coimbatore",
    Attachment: "https://link.springer.com/book/10.1007/978-981-19-3311-0"
  },
  {
    id: 2,
    title: "Auto correct AI GramBot using RNN",
    Name: "Ms. Hannah Rose Esther T ",
    Conference: "International Conference on Futuristic Digital Technologies for Sustainable Development",
    Type: "International",
    Organizer: "AMET University",
    Attachment: "https://drive.google.com/file/d/1ALGQRgAFfQkOKM1YIOYKhtyvtZQ-9wvb/view?usp=share_link"
  },
  {
    id: 3,
    title: "Novel concept Drift Detection using Fuzzy based drift detector in IOT Data Stream",
    Name: "Ms. Hannah Rose Esther T",
    Conference: "International Conference on Futuristic Digital Technologies for Sustainable Development",
    Type: "International",
    Organizer: "RVS Technical Campus, Coimbatore",
    Attachment: "https://drive.google.com/file/d/1oOM2GUPiIDkzAKx2KjblGjP7TnI2fNvp/view?usp=share_link"
  },
  {
    id: 4,
    title: "Advances in AI for Predicting Surgical Complications: improving patient Outcome through Data Analysis",
    Name: "S.Saranya",
    Conference: "8th National Conference on Advanced Computing Technologies NCACT'23",
    Type: "National",
    Organizer: "Dept of CSE, Velammal Engineering College",
    Attachment: "https://drive.google.com/file/d/178o_Ar7SDDP-aTJpnKYOzt7vmkk3gtyg/view?usp=share_link"
  },
  {
    id: 5,
    title: "Cloud Computing on Embedded Systems",
    Name: "S.Saranya",
    Conference: "National Conference on Recent Technologies and Computing Sciences",
    Type: "International",
    Organizer: "Dept of IT, Velammal Engineering College",
    Attachment: "https://drive.google.com/file/d/1B8fouE3GIZGAL1Jy4zBjCR2WKjbK6rCn/view?usp=share_link"
  },
  {
    id: 6,
    title: "Multiple disease Prediction system",
    Name: "A.Prema",
    Conference: "National Conference on Recent Technologies and Computing Sciences-NCRTCS'23",
    Type: "National",
    Organizer: "Velammal Engineering College",
    Attachment: "https://drive.google.com/file/d/1TICvxKkdioYy4_TMKpfq8a0eFDybK0YQ/view?usp=share_link"
  },
  {
    id: 7,
    title: "Smart Voting System using Face Recognition",
    Name: "A.Prema",
    Conference: "National Conference on Recent Technologies and Computing Sciences-NCRTCS'23",
    Type: "National",
    Organizer: "Velammal Engineering College",
    Attachment: "https://drive.google.com/file/d/1SiWt12WqLGtXd8Yylfo_4i5LSh5VmSR1/view?usp=share_link"
  },
  {
    id: 8,
    title: "Face Recognition Attendance System",
    Name: "A.Prema",
    Conference: "National Conference on Recent Technologies and Computing Sciences-NCRTCS'23",
    Type: "National",
    Organizer: "Velammal Engineering College",
    Attachment: "https://drive.google.com/file/d/1F7CPnY7yzCFEJZ3cddpw1qcZxDnvDa_G/view?usp=share_link"
  }
];

function Conference() {
  const [expandedIds, setExpandedIds] = useState([]);

  const handleExpand = (id) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter(expandedId => expandedId !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const leftColumnCards = cards.filter((_, index) => index % 2 === 0);
  const rightColumnCards = cards.filter((_, index) => index % 2 === 1);

  return (
    <div className="container">
      <h1 className='cards-h1'>Conferences</h1>
      <div className="wrapper">
        <div className="grid-con">
          <div className="column">
            {leftColumnCards.map((card) => (
              <div
                key={card.id}
                className="card"
                style={{
                  height: 'auto',
                }}
              >
                <div className="card-content">
                  <h2 className="cards-p"><b>Title: </b>{card.title}</h2>
                  <p className='cards-p'><b>Name Of the Faculty: </b>{card.Name}</p>
                  <p className='cards-p'><b>Name Of the Conference: </b>{card.Conference}</p>
                  {expandedIds.includes(card.id) && (
                    <div>
                        <p className='cards-p'><b>Type: </b>{card.Type}</p>
                        <p className='cards-p'><b>Organizer: </b>{card.Organizer}</p>
                        <span className='cards-p'><b>Link:</b><a href = {card.Attachment} className='cards-link'>{card.Attachment}</a></span>
                    </div>
                  )}
                  <button
                    onClick={() => handleExpand(card.id)}
                    className="button"
                  >
                    <span className='cards-viewmore'>
                      {expandedIds.includes(card.id) ? 'View Less' : 'View More'}
                    </span>
                    {expandedIds.includes(card.id) ? (
                      <ChevronUp className="icon cards-viewmore" />
                    ) : (
                      <ChevronDown className="icon cards-viewmore" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="column">
            {rightColumnCards.map((card) => (
              <div
                key={card.id}
                className="card"
                style={{
                  height: 'auto',
                }}
              >
                <div className="card-content">
                  <h2 className="cards-p"><b>Title: {card.title}</b></h2>
                  <p className='cards-p'><b>Name Of the Faculty: </b>{card.Name}</p>
                  <p className='cards-p'><b>Name Of the Conference: </b>{card.Conference}</p>
                  {expandedIds.includes(card.id) && (
                    <div>
                        <p className='cards-p'><b>Type: </b>{card.Type}</p>
                        <p className='cards-p'><b>Organizer: </b>{card.Organizer}</p>
                        <span className='cards-p'><b>Link:</b><a href = {card.Attachment} className='cards-link'>{card.Attachment}</a></span>
                    </div>
                  )}
                  <button
                    onClick={() => handleExpand(card.id)}
                    className="button"
                  >
                    <span className='cards-viewmore'>
                      {expandedIds.includes(card.id) ? 'View Less' : 'View More'}
                    </span>
                    {expandedIds.includes(card.id) ? (
                      <ChevronUp className="icon cards-viewmore" />
                    ) : (
                      <ChevronDown className="icon cards-viewmore" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Conference;
