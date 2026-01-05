import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./questions.css";
import axios from "axios";
import Swal from "sweetalert2";

const alertBox = (title, text, icon = "info") => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
  });
};

const QuestionPage = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const exam =
    location.state?.exam ||
    JSON.parse(localStorage.getItem("exam_data"));
  const student = location.state?.student;
  const token = location.state?.token;

  // SAFETY CHECK
  useEffect(() => {
    if (!exam) {
      navigate("/QA/qaexam", { replace: true });
    }
  }, [exam]);
  // ---------------- QUESTIONS ----------------
  const questions = exam.questions.map((q, index) => ({
    id: index + 1,
    question: q.question,
    options: [q.A, q.B, q.C, q.D],
  }));

  // ---------------- STATE ----------------
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [visited, setVisited] = useState({});
  const scrollRef = useRef(null);
  const circleRefs = useRef([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [offlineSeconds, setOfflineSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [violations, setViolations] = useState({
    fullscreenExit: 0,
    tabSwitch: 0,
  });
  const MAX_VIOLATIONS = 3;

  const q = questions[current];

  // ---------------- DISABLE CLIPBOARD ----------------------
  useEffect(() => {
    const blockClipboard = (e) => e.preventDefault();

    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("paste", blockClipboard);

    return () => {
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
    };
  }, []);

  // ---------------- BACK PROPAGATION HABDLE ----------------
  useEffect(() => {
    // Push dummy state so back button stays on this page
    window.history.pushState(null, "", window.location.href);

    const blockBackNavigation = () => {
      Swal.fire({
        title: "Exam in Progress",
        text: "You cannot go back during the exam.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      window.history.pushState(null, "", window.location.href);
    };

    const warnBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "You have an ongoing exam.";
    };

    window.addEventListener("popstate", blockBackNavigation);
    window.addEventListener("beforeunload", warnBeforeUnload);

    return () => {
      window.removeEventListener("popstate", blockBackNavigation);
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, []);

  // ---------------- CHECK FOR INTERNET CONNECTION ----------
  useEffect(() => {
    let offlineTimer = null;

    const handleOnline = () => {
      setIsOnline(true);

      if (offlineTimer) {
        clearInterval(offlineTimer);
        offlineTimer = null;
      }

      Swal.fire({
        title: "Connection Restored",
        text: "Internet connection is back. You may continue the exam.",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineCount(prev => prev + 1);

      Swal.fire({
        title: "Connection Lost",
        text: "Internet connection lost. Please wait, your exam is paused.",
        icon: "warning",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      offlineTimer = setInterval(() => {
        setOfflineSeconds(prev => prev + 1);
      }, 1000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (offlineTimer) clearInterval(offlineTimer);
    };
  }, []);

  // ---------------- COUNT THE VIOLATION ACTIVITIES ----------
  const registerViolation = (type, message) => {
    setViolations(prev => {
      const updated = {
        ...prev,
        [type]: prev[type] + 1,
      };

      const total =
        updated.fullscreenExit +
        updated.tabSwitch;

      Swal.fire({
        title: "Warning",
        text: `${message}\n\nTotal Violations: ${total}`,
        icon: "warning",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        if (total >= MAX_VIOLATIONS) {
          submitExam(true);
        } else if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      });

      return updated;
    });
  };

  // ---------------- BLOCK ALL KEYBOARD ----------------
  useEffect(() => {
    const blockKeyboard = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    document.addEventListener("keydown", blockKeyboard, true);
    document.addEventListener("keyup", blockKeyboard, true);
    document.addEventListener("keypress", blockKeyboard, true);

    return () => {
      document.removeEventListener("keydown", blockKeyboard, true);
      document.removeEventListener("keyup", blockKeyboard, true);
      document.removeEventListener("keypress", blockKeyboard, true);
    };
  }, []);

  // ---------------- FULLSCREEN ENFORCE ----------------
  useEffect(() => {
    const enterFullscreenOnce = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      document.removeEventListener("click", enterFullscreenOnce);
    };

    document.addEventListener("click", enterFullscreenOnce);

    return () => {
      document.removeEventListener("click", enterFullscreenOnce);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        registerViolation(
          "fullscreenExit",
          "You exited fullscreen mode."
        );
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // ---------------- TAB SWITCH DETECTION ----------------
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        registerViolation(
          "tabSwitch",
          "Tab or window switch detected."
        );
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // ---------------- DISABLE RIGHT CLICK ----------------
  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);
    return () => document.removeEventListener("contextmenu", disableContextMenu);
  }, []);

  // ---------------- AUTO SCROLL PROGRESS ----------------
  useEffect(() => {
    if (circleRefs.current[current]) {
      circleRefs.current[current].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [current]);

  // ---------------- ACTIONS ----------------
  const selectOption = async (opt) => {
    setSelected((prev) => ({ ...prev, [current]: opt }));

    // await axios.post("/api/main-backend/next", {
    //   token,
    //   question: questions[current].question,
    //   choosedOption: opt,
    // });
  };

  const nextQuestion = async () => {
    if (!selected[current]) {
      alertBox("Required", "Please select an option before continuing.", "info");
      return;
    }

    const success = await submitCurrentAnswer();
    if (!success) return;

    setVisited((prev) => ({ ...prev, [current]: true }));
    setCurrent((prev) => prev + 1);
  };

  const submitCurrentAnswer = async () => {
    try {
      const currentQuestion = questions[current];

      await axios.post("/api/main-backend/next", {
        token,
        question: currentQuestion.question,
        choosedOption: selected[current],
      });

      return true;
    } catch (error) {
      Swal.fire({
        title: "Submission Error",
        text: error.response?.data?.message || "Failed to save answer",
        icon: "error",
        allowOutsideClick: false,
      });
      return false;
    }
  };

  const submitExam = async (forced = false) => {
    if (selected[current]) {
      await submitCurrentAnswer();
    }
    Swal.fire({
      title: forced ? "Exam Terminated" : "Exam Completed",
      text: forced
        ? "You exceeded the allowed number of violations."
        : "Exam submitted successfully.",
      icon: forced ? "error" : "success",
      confirmButtonText: "OK",
    }).then(() => {
      console.log("Answers:", selected);
      console.log("Violations:", violations);
      // send to backend here
    });
  };

  // ---------------- UI ----------------
  return (
    <>
      <div className="left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* LEFT — Violation Counters */}
          <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">Fullscreen:</span>
              <span className="text-red-600">{violations.fullscreenExit}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">Tab Switch:</span>
              <span className="text-red-600">{violations.tabSwitch}</span>
            </div>
          </div>

          {/* RIGHT — Network Status */}
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border
              ${isOnline
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
              }
            `}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full
                ${isOnline ? "bg-green-500" : "bg-red-500 animate-pulse"}
              `}
            ></span>
            {isOnline ? "Online" : "Offline"}
            {!isOnline && (
              <span className="ml-1 text-xs font-medium">(Paused)</span>
            )}
          </div>

        </div>
      </div>
      <div className="quest_page relative select-none">
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
                  onChange={() => selectOption(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          <div className="quest_button_area">
            {current < questions.length - 1 ? (
              <button className="quest_btn_next" onClick={nextQuestion}>Next</button>
            ) : (
              <button className="quest_btn_submit" onClick={() => submitExam()}>Submit</button>
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
    </>
  );
};

export default QuestionPage;