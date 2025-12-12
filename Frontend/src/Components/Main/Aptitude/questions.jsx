import { useState, useRef, useEffect } from "react";
import AptitudeHeader from "./AptitudeHeader";
import "./questions.css";

const QuestionPage = () => {
  const questions = [
    { id: 1, question: "What is the capital of India?", options: ["Mumbai", "Delhi", "Chennai", "Kolkata"], answer: "Delhi" },
    { id: 2, question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: "Mars" },
    { id: 3, question: "2 + 2 = ?", options: ["3", "4", "5", "6"], answer: "4" },
    { id: 4, question: "Who wrote the Ramayana?", options: ["Tulsidas", "Valmiki", "Kabir", "Kalidas"], answer: "Valmiki" },
    { id: 5, question: "Which gas do plants absorb?", options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"], answer: "Carbon Dioxide" },
    { id: 6, question: "Smallest prime number?", options: ["0", "1", "2", "3"], answer: "2" },
    { id: 7, question: "Largest ocean?", options: ["Indian", "Pacific", "Atlantic", "Arctic"], answer: "Pacific" },
    { id: 8, question: "The Sun is a ___?", options: ["Planet", "Star", "Satellite", "Galaxy"], answer: "Star" },
    { id: 9, question: "National animal of India?", options: ["Lion", "Tiger", "Elephant", "Leopard"], answer: "Tiger" },
    { id: 10, question: "Which is the longest river?", options: ["Ganga", "Amazon", "Nile", "Yamuna"], answer: "Nile" },
    { id: 11, question: "Extra Question 11", options: ["A","B","C","D"], answer:"A" },
    { id: 12, question: "Extra Question 12", options: ["A","B","C","D"], answer:"B" },
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [visited, setVisited] = useState({});
  const scrollRef = useRef(null);
  const circleRefs = useRef([]);

  // ---------- TIMER STATE ----------
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const handleSelect = (opt) => setSelected(prev => ({ ...prev, [current]: opt }));

  const nextQuestion = () => {
    if (!selected[current]) {
      alert("Please answer this question before continuing.");
      return;
    }
    setVisited(prev => ({ ...prev, [current]: true }));
    setCurrent(current + 1);
  };

  const handleSubmit = () => {
    alert("Exam Completed!");
    console.log(selected);
  };

  // Auto scroll to current circle
  useEffect(() => {
    if (circleRefs.current[current]) {
      circleRefs.current[current].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [current]);

  const q = questions[current];

  return (
    <div className="quest_page relative">
      {/* HEADER WITH TIMER */}
      {/* <AptitudeHeader timer={formatTime(timeLeft)} /> */}

      {/* LEFT COLUMN */}
      <div className="quest_left">
        <h2 className="quest_title">Question</h2>
        <h3 className="quest_question">{q.id}. {q.question}</h3>
      </div>

      {/* CENTER COLUMN */}
      <div className="quest_center">
        <h2 className="quest_options_title">Options</h2>
        <div className="quest_options_container">
          {q.options.map((opt, index) => (
            <label key={index} className="quest_option">
              <input
                type="radio"
                name={`q-${current}`}
                checked={selected[current] === opt}
                onChange={() => handleSelect(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <div className="quest_button_area">
          {current < questions.length - 1 ? (
            <button className="quest_btn_next" onClick={nextQuestion}>Next</button>
          ) : (
            <button className="quest_btn_submit" onClick={handleSubmit}>Submit</button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN – SCROLLABLE CIRCLES */}
      <div className="quest_right">
        <h2 className="quest_progress_title">Progress</h2>
        <div className="quest_circles_scroll" ref={scrollRef}>
          {questions.map((_, index) => (
            <div
              key={index}
              ref={el => circleRefs.current[index] = el}
              className={`quest_circle 
                ${current === index ? "quest_circle_active" : ""} 
                ${visited[index] ? "quest_circle_done" : ""}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
