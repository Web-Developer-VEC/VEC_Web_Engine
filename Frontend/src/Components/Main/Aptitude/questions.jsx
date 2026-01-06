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

  const exam = location.state?.exam || JSON.parse(localStorage.getItem("exam_data"));
  const student = location.state?.student;

  // ✅ STATE
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null); // ✅ TIMER STATE
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const [violations, setViolations] = useState({
    fullscreenExit: 0,
    tabSwitch: 0,
  });

  const scrollRef = useRef(null);
  const circleRefs = useRef([]);
  const MAX_VIOLATIONS = 10;

  // SAFETY CHECK
  useEffect(() => {
    if (!exam || !student) {
      navigate("/QA/qaexam", { replace: true });
    }
  }, [exam, student, navigate]);

  const questions = exam?.questions?.map((q, index) => ({
    id: index + 1,
    question: q.question,
    options: [q.A, q.B, q.C, q.D],
  })) || [];

  const q = questions[current];

  // ✅ TIMER - Fetch remaining time and countdown
  useEffect(() => {
    const fetchRemainingTime = async () => {
      try {
        const res = await axios.get("/api/main-backend/qa/session/time");
        setTimeLeft(res.data.remainingSeconds);
      } catch (err) {
        if (err.response?.data?.status === "TIME_UP") {
          await submitExam(true);
        } else {
          forceExit(err.response?.data || {});
        }
      }
    };

    fetchRemainingTime();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          submitExam(true); // Auto-submit when time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Format time as MM:SS
  const formatTime = (seconds) => {
    if (seconds === null) return "Loading...";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ---------------- SESSION CHECK STATUS -------------------
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get("/api/main-backend/qa/session/status");

        if (res.data.status !== "ACTIVE") {
          forceExit(res.data);
        }
      } catch {
        forceExit({ reason: "Session verification failed" });
      }
    };

    verifySession();
  }, []);

  // ✅ RESUME EXAM DATA
  useEffect(() => {
    const resumeExam = async () => {
      try {
        const res = await axios.get("/api/main-backend/qa/session/resume-data");

        const { currentQuestionIndex, selectedAnswers } = res.data;

        const normalizedSelected = {};
        const normalizedVisited = {};

        Object.keys(selectedAnswers || {}).forEach((idx) => {
          const index = Number(idx);
          normalizedSelected[index] = selectedAnswers[idx];
          normalizedVisited[index] = true;
        });

        setCurrent(currentQuestionIndex || 0);
        setSelected(normalizedSelected);
        setVisited(normalizedVisited);
      } catch (err) {
        forceExit(err.response?.data || {});
      }
    };

    resumeExam();
  }, []);

  // ---------------- HEARTBEAT CHECK ---------------
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await axios.post("/api/main-backend/qa/session/heartbeat");
      } catch (err) {
        forceExit(err.response?.data || {});
      }
    }, 15000); // every 15 sec

    return () => clearInterval(interval);
  }, []);

  // ---------------- BEACON ON UNLOAD ---------------
  useEffect(() => {
    const onUnload = () => {
      navigator.sendBeacon("/api/main-backend/qa/session/offline");
    };

    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

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

  // ---------------- BLOCK BACK NAVIGATION ----------------
  useEffect(() => {
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

  // ---------------- OFFLINE/ONLINE HANDLING ----------
  useEffect(() => {
    const handleOffline = async () => {
      setIsOnline(false);
      await axios.post("/api/main-backend/qa/session/offline");

      Swal.fire({
        title: "Connection Lost",
        text: "Exam paused. Please reconnect.",
        icon: "warning",
        allowOutsideClick: false,
        showConfirmButton: false,
      });
    };

    const handleOnline = async () => {
      setIsOnline(true);

      try {
        await axios.post("/api/main-backend/qa/session/resume");

        const res = await axios.get("/api/main-backend/qa/session/resume-data");

        setCurrent(res.data.currentQuestionIndex || 0);
        setSelected(res.data.selectedAnswers || {});
        setVisited(res.data.selectedAnswers || {});

        Swal.fire({
          title: "Resumed",
          text: "Exam resumed",
          icon: "success",
          timer: 2000,
        });
      } catch (err) {
        forceExit(err.response?.data || {});
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // ---------------- VIOLATION TRACKING ----------------
  const registerViolation = async (type, message) => {
    try {
      setViolations((prev) => ({
        ...prev,
        [type]: (prev[type] || 0) + 1,
      }));

      const res = await axios.post("/api/main-backend/qa/session/violation", {
        type,
        timestamp: new Date().toISOString(),
      });

      if (res.data.terminated) {
        forceExit({ reason: "Violation limit exceeded" });
        return;
      }

      Swal.fire({
        title: "⚠️ Warning",
        html: `
          <p>${message}</p>
          <p style="margin-top: 10px; color: #dc3545; font-weight: bold;">
            Total Violations: ${res.data.fullscreenExit + res.data.tabSwitch}
          </p>
        `,
        icon: "warning",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err) {
      forceExit(err.response?.data || {});
    }
  };

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

  // ---------------- SELECTIVE KEYBOARD BLOCKING ----------------
  useEffect(() => {
    const blockDangerousKeys = (e) => {
      const target = e.target;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Block DevTools
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        return false;
      }

      // Block Copy/Paste
      if (e.ctrlKey && ["c", "v", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }

      // Block Print Screen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        registerViolation("printScreen", "Screenshot attempt detected");
        return false;
      }
    };

    document.addEventListener("keydown", blockDangerousKeys, true);
    return () => document.removeEventListener("keydown", blockDangerousKeys, true);
  }, []);

  // ---------------- FULLSCREEN ENFORCEMENT ----------------
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        registerViolation("fullscreenExit", "You exited fullscreen mode.");

        Swal.fire({
          title: "Return to Fullscreen",
          text: "Click OK to continue the exam",
          icon: "warning",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          document.documentElement.requestFullscreen().catch(() => {
            forceExit({ reason: "Unable to maintain fullscreen mode" });
          });
        });
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // ---------------- WINDOW BLUR DETECTION (Better Alt+Tab Detection) ----------------
  useEffect(() => {
    const onWindowBlur = () => {
      // This fires when user clicks outside browser or Alt+Tabs
      registerViolation(
        "windowBlur",
        "Focus lost - Did you switch windows?"
      );
    };

    window.addEventListener('blur', onWindowBlur);
    return () => window.removeEventListener('blur', onWindowBlur);
  }, []);

  // ---------------- MOUSE LEAVE DETECTION ----------------
  useEffect(() => {
    const onMouseLeave = () => {
      // Detects when mouse leaves the browser window
      registerViolation(
        "mouseLeave",
        "Mouse left browser window"
      );
    };

    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, []);

  // ---------------- PREVENT TEXT SELECTION (Smarter Version) ----------------
  useEffect(() => {
    const preventSelection = (e) => {
      e.preventDefault();
    };

    document.addEventListener('selectstart', preventSelection);
    return () => document.removeEventListener('selectstart', preventSelection);
  }, []);

  // ---------------- SCREENSHOT DETECTION (Advanced) ----------------
  useEffect(() => {
    const detectScreenshot = (e) => {
      if (
        (e.key === 'PrintScreen') ||
        (e.metaKey && e.shiftKey && ['3', '4'].includes(e.key)) ||
        (e.metaKey && e.shiftKey && e.key === 's')
      ) {
        registerViolation('screenshot', 'Screenshot attempt detected');
      }
    };

    document.addEventListener('keyup', detectScreenshot);
    return () => document.removeEventListener('keyup', detectScreenshot);
  }, []);

  // ---------------- FOCUS THEFT PREVENTION ----------------
  useEffect(() => {
    let consecutiveFocusLoss = 0;
    const FOCUS_CHECK_INTERVAL = 2000; // 2 seconds
    const MAX_CONSECUTIVE_LOSS = 5; // 10 seconds total (5 × 2s)

    const enforceWindowFocus = () => {
      if (document.hidden || !document.hasFocus()) {
        consecutiveFocusLoss++;
        
        // Only register violation after sustained focus loss
        if (consecutiveFocusLoss === 3) {
          registerViolation(
            "sustainedFocusLoss",
            "Sustained focus loss detected (6 seconds)"
          );
        }
        
        if (consecutiveFocusLoss >= MAX_CONSECUTIVE_LOSS) {
          forceExit({ 
            reason: 'Excessive focus loss detected. Exam terminated for security.' 
          });
        }
      } else {
        // Reset counter when focus returns
        consecutiveFocusLoss = 0;
      }
    };

    const interval = setInterval(enforceWindowFocus, FOCUS_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // ---------------- TAB SWITCH DETECTION ----------------
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        registerViolation("tabSwitch", "Tab or window switch detected.");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
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
  const forceExit = (data) => {
    Swal.fire({
      title: "Exam Ended",
      text: data.reason || "Your exam session is no longer active.",
      icon: "error",
      allowOutsideClick: false,
    }).then(() => {
      navigate("/QA/qaexam", { replace: true });
    });
  };

  const selectOption = (opt) => {
    setSelected((prev) => ({ ...prev, [current]: opt }));
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
      setLoading(true);
      const currentQuestion = questions[current];

      await axios.post("/api/main-backend/next", {
        question: currentQuestion.question,
        choosedOption: selected[current],
        questionIndex: current,
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
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async (forced = false) => {
    if (selected[current]) {
      await submitCurrentAnswer();
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/main-backend/studentresult", 
        {
          scheduleId: exam.scheduleId
        }
      );

      const { registerno, name, department, year, totalMarks } = res.data;

      Swal.fire({
        title: "Exam Result",
        icon: "success",
        html: `
          <div style="text-align:left;font-size:15px">
            <p><b>Register No:</b> ${registerno}</p>
            <p><b>Name:</b> ${name}</p>
            <p><b>Department:</b> ${department}</p>
            <p><b>Year:</b> ${year}</p>
            <hr/>
            <h3 style="text-align:center;color:#16a34a">
              Total Marks: ${totalMarks}
            </h3>
          </div>
        `,
        confirmButtonText: "Finish",
        allowOutsideClick: false,
      }).then(() => {
        navigate("/QA/qaexam", { replace: true });
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch result",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <>
      {/* ✅ TIMER HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            Time Left: <span className={timeLeft < 300 ? "text-red-600" : "text-green-600"}>{formatTime(timeLeft)}</span>
          </div>

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

          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${
              isOnline
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500 animate-pulse"
              }`}
            ></span>
            {isOnline ? "Online" : "Offline"}
            {!isOnline && <span className="ml-1 text-xs font-medium">(Paused)</span>}
          </div>
        </div>
      </div>

      <div className="quest_page relative select-none" style={{ paddingTop: "80px" }}>
        {/* LEFT COLUMN */}
        <div className="quest_left">
          <h2 className="quest_title">Question</h2>
          <h3 className="quest_question">
            {q?.id}. {q?.question}
          </h3>
        </div>

        {/* CENTER COLUMN */}
        <div className="quest_center">
          <h2 className="quest_options_title">Options</h2>
          <div className="quest_options_container" key={current}>
            {q?.options.map((opt, index) => (
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
              <button className="quest_btn_next" onClick={nextQuestion} disabled={loading}>
                {loading ? "Saving..." : "Next"}
              </button>
            ) : (
              <button className="quest_btn_submit" onClick={() => submitExam()} disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="quest_right">
          <h2 className="quest_progress_title">Progress</h2>
          <div className="quest_circles_scroll" ref={scrollRef}>
            {questions.map((_, index) => (
              <div
                key={index}
                ref={(el) => (circleRefs.current[index] = el)}
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