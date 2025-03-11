import React, { useState } from 'react';
import './TutorialPage2.css';

function TutorialPage2() {
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showVideo, setShowVideo] = useState(false);

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

  // Function to show the video in the overlay
  const showVideoOverlay = () => {
    setShowVideo(true);
  };

  // Handle clicking outside the overlay (PDF or video) to close it
  const handleOutsideClick = (e) => {
    if (showPdf && e.target.className === 'svp-pdf-overlay') {
      setShowPdf(false);
      setPdfUrl('');
    }
    if (showVideo && e.target.className === 'svp-video-overlay') {
      setShowVideo(false);
    }
  };

  return (
    <div className="svp-container" onClick={handleOutsideClick}>
      <div className="wrapper">
        {/* Introduction */}
        <div className="svp-intro">
          <h1 className="svp-title">Single Video Tutorial</h1>
          <p className="svp-text">Introductory content about the single video tutorial goes here.</p>
        </div>

        {/* PDF Button */}
        <div className="svp-pdf-section">
          <button className="svp-pdf-button" onClick={getRandomPdf}>
            Refer This
          </button>
        </div>
      </div>

      {/* Video Section (Thumbnail View) */}
      <div className="svp-video-section">
        <video 
          controls 
          className="svp-video-thumbnail" 
          onClick={showVideoOverlay}
        >
          <source src="path-to-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* PDF Overlay */}
      {showPdf && (
        <div className="svp-pdf-overlay">
          <div className="svp-pdf-content">
            <iframe src={pdfUrl} title="PDF Viewer" className="svp-pdf-iframe" />
            <button className="svp-pdf-close-button" onClick={() => setShowPdf(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Video Overlay */}
      {showVideo && (
        <div className="svp-video-overlay">
          <div className="svp-video-content">
            <video controls autoPlay className="svp-video-full">
              <source src="path-to-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button className="svp-video-close-button" onClick={() => setShowVideo(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorialPage2;