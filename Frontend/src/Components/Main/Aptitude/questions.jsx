import { useState, useRef, useEffect } from "react";
import AptitudeHeader from "./AptitudeHeader";
import "./questions.css";
import Swal from "sweetalert2";

const showSweetAlert = (title, text, icon = "info", confirmButtonText = "OK") => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
  });
};

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
  const [status, setStatus] = useState('active');
  const scrollRef = useRef(null);
  const circleRefs = useRef([]);
    const handlersRef = useRef({
    popstate: null,
    beforeUnload: null,
    keydown: null,
    docClick: null,
    contextmenu: null,
  });

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

  const triggerViolation = (msg) => {
  alert(msg);
};
  
  const nextQuestion = () => {
    if (!selected[current]) {
      alert("Please answer this question before continuing.");
      return;
    }
    setVisited(prev => ({ ...prev, [current]: true }));
    setCurrent(current + 1);
  };

  const handleSubmit = () => {
    showSweetAlert("completed","Exam Completed!","success");
    console.log(selected);
  };
    const startExam = () => {
    setStatus('active');
    document.documentElement.requestFullscreen().catch(() => {
      showSweetAlert("Alert!","Fullscreen is required. Please use a Chrome browser on Desktop.","error");
    });
  };

  // Auto scroll to current circle
  useEffect(() => {
    if (circleRefs.current[current]) {
      circleRefs.current[current].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [current]);

  const q = questions[current];
useEffect(() => {
  if (status !== "active") return;

  const handleKeyDown = (e) => {
    if (e.ctrlKey && ["c", "v", "p", "u", "s"].includes(e.key.toLowerCase())) {
      e.preventDefault();
     showSweetAlert("Alert",`Shortcut Ctrl+${e.key.toUpperCase()} blocked`,"error");
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) showSweetAlert("Alert!","Tab/Window Switch detected","error");
  };

  const handleBlur = () => showSweetAlert("Alert!","Window focus lost (Alt+Tab)","error");

  const handleContextMenu = (e) => e.preventDefault();

  window.addEventListener("keydown", handleKeyDown);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleBlur);
  window.addEventListener("contextmenu", handleContextMenu);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("contextmenu", handleContextMenu);
  };
}, [status]);
 useEffect(() => {
    if (status !== "active") {
      removeNavigationGuards();
      return;
    }

    // helper to push dummy state
    const pushDummyState = () => {
      try {
        window.history.pushState({ examGuard: true }, "");
      } catch (e) {
        // ignore if pushState fails in this environment
      }
    };
    const onPopState = (e) => {
      // immediately re-push so browser stays on the same page
      pushDummyState();
    };
    // beforeunload -> native confirm dialog on refresh/close
    const onBeforeUnload = (e) => {
      const confirmationMessage = "You have an ongoing exam. Are you sure you want to leave?";
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    };

    // intercept <a> links
    const onDocClick = (ev) => {
      const anchor = ev.target.closest && ev.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      ev.preventDefault();
      // showSweetAlert("Navigation blocked", "You cannot navigate away during the exam. Please finish or submit the exam first.", "error");
    };

    // extra keydown checks to block alt+arrow / backspace navigation
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (e.ctrlKey && ["c", "v", "p", "u", "s"].includes(key)) {
        e.preventDefault();
        showSweetAlert("Shortcut blocked", `Ctrl+${key.toUpperCase()} is disabled during the exam.`, "error");
        return;
      }
      if (e.altKey && (key === "arrowleft" || key === "arrowright")) {
        e.preventDefault();
        // showSweetAlert("Navigation blocked", "Navigation keys are disabled during the exam.", "error");
        return;
      }
      const activeTag = document.activeElement && document.activeElement.tagName;
      if (key === "backspace" && !["INPUT", "TEXTAREA"].includes(activeTag)) {
        e.preventDefault();
        // showSweetAlert("Navigation blocked", "Backspace navigation is disabled during the exam.", "error");
        return;
      }
    };

    const onContextMenu = (e) => e.preventDefault();

    // push initial dummy state and register handlers
    pushDummyState();

    handlersRef.current.popstate = onPopState;
    handlersRef.current.beforeUnload = onBeforeUnload;
    handlersRef.current.docClick = onDocClick;
    handlersRef.current.keydown = onKeyDown;
    handlersRef.current.contextmenu = onContextMenu;

    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onDocClick, true);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("contextmenu", onContextMenu);

    return () => {
      removeNavigationGuards();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const removeNavigationGuards = () => {
    try {
      if (handlersRef.current.popstate) {
        window.removeEventListener("popstate", handlersRef.current.popstate);
        handlersRef.current.popstate = null;
      }
      if (handlersRef.current.beforeUnload) {
        window.removeEventListener("beforeunload", handlersRef.current.beforeUnload);
        handlersRef.current.beforeUnload = null;
      }
      if (handlersRef.current.docClick) {
        document.removeEventListener("click", handlersRef.current.docClick, true);
        handlersRef.current.docClick = null;
      }
      if (handlersRef.current.keydown) {
        window.removeEventListener("keydown", handlersRef.current.keydown, true);
        handlersRef.current.keydown = null;
      }
      if (handlersRef.current.contextmenu) {
        window.removeEventListener("contextmenu", handlersRef.current.contextmenu);
        handlersRef.current.contextmenu = null;
      }
    } catch (err) {
      // ignore removal errors
    }

    try {
      window.history.replaceState({}, "");
    } catch (e) {}
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      removeNavigationGuards();
    };
  }, []);


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
