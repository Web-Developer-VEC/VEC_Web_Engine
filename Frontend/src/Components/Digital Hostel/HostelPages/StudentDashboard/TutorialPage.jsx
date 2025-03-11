import React, { useState } from 'react';
import './TutorialPage.css';

function TutorialPage() {
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showVideo, setShowVideo] = useState(null); // null or video index (0 or 1)

  // Function to generate a random PDF URL (simulated)
  const getRandomPdf = () => {
    const pdfs = [
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Example PDF 1
      'https://www.africau.edu/images/default/sample.pdf', // Example PDF 2
      'https://arxiv.org/pdf/quant-ph/0410100.pdf' // Example PDF 3
    ];
    const randomIndex = Math.floor(Math.random() * pdfs.length);
    setPdfUrl(pdfs[randomIndex]);
    setShowPdf(true);
  };

  // Function to show a video in the overlay
  const showVideoOverlay = (index) => {
    setShowVideo(index); // 0 for first video, 1 for second video
  };

  // Handle clicking outside the overlay (PDF or video) to close it
  const handleOutsideClick = (e) => {
    if (showPdf && e.target.className === 'tut-pdf-overlay') {
      setShowPdf(false);
      setPdfUrl('');
    }
    if (showVideo !== null && e.target.className === 'tut-video-overlay') {
      setShowVideo(null);
    }
  };

  return (
    <div className="tut-container" onClick={handleOutsideClick}>
      {/* Tutorial Introduction */}
      <div className="wrapper">
        <div className="tut-intro">
          <h1 className="tut-title">Tutorial</h1>
          <p className="tut-text">Introductory content about the tutorial goes here.</p>
        </div>

        {/* PDF Button */}
        <div className="tut-pdf-section">
          <button className="tut-pdf-button" onClick={getRandomPdf}>
            Refer This
          </button>
        </div>
      </div>

      {/* Video Sections (Thumbnail View) */}
      <div className="tut-video-container">
        <div className="tut-video-section">
          <video 
            controls 
            className="tut-video-thumbnail" 
            onClick={() => showVideoOverlay(0)}
          >
            <source src="path-to-video1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="tut-video-section">
          <video 
            controls 
            className="tut-video-thumbnail" 
            onClick={() => showVideoOverlay(1)}
          >
            <source src="path-to-video2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* PDF Overlay */}
      {showPdf && (
        <div className="tut-pdf-overlay">
          <div className="tut-pdf-content">
            <iframe src={pdfUrl} title="PDF Viewer" className="tut-pdf-iframe" />
            <button className="tut-pdf-close-button" onClick={() => setShowPdf(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Video Overlay */}
      {showVideo !== null && (
        <div className="tut-video-overlay">
          <div className="tut-video-content">
            <video controls autoPlay className="tut-video-full">
              <source 
                src={showVideo === 0 ? 'path-to-video1.mp4' : 'path-to-video2.mp4'} 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
            <button className="tut-video-close-button" onClick={() => setShowVideo(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorialPage;