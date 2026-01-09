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

// ✅ REAL INTERNET CHECK - Not just network adapter
const checkRealInternet = async () => {
  try {
    await axios.get("/api/main-backend/qa/session/ping", {
      timeout: 5000,
      headers: { "Cache-Control": "no-cache" }
    });
    return true;
  } catch {
    return false;
  }
};

const QuestionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const exam = location.state?.exam || JSON.parse(localStorage.getItem("exam_data"));
  const student = location.state?.student;
  const violation = location.state?.violations;

  // ✅ STATE
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isOnline, setIsOnline] = useState(true); // Start optimistic
  const [loading, setLoading] = useState(false);
  const [violations, setViolations] = useState({
    fullscreenExit: violation.fullscreenExit || 0,
    tabSwitch: violation.tabSwitch || 0,
  });

  const scrollRef = useRef(null);
  const circleRefs = useRef([]);
  const MAX_VIOLATIONS = 10;
  
  // ✅ Refs to track states
  const isFullscreenWarningShown = useRef(false);
  const offlineAlertShown = useRef(false);

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

  // ✅ TIMER
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
          submitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null) return "Loading...";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // SESSION CHECK STATUS
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get("/api/main-backend/qa/session/status");
        if (res.data.status !== "ACTIVE") {
          forceExit(res.data);
        }
      } catch (err) {
        console.error("Session verification error:", err);
      }
    };
    verifySession();
  }, []);

  // RESUME EXAM DATA
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
        console.error("Resume exam error:", err);
      }
    };
    resumeExam();
  }, []);

  // HEARTBEAT CHECK
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await axios.post("/api/main-backend/qa/session/heartbeat");
      } catch (err) {
        forceExit(err.response?.data || {});
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // BEACON ON UNLOAD
  useEffect(() => {
    const onUnload = () => {
      const beaconSent = navigator.sendBeacon(
        "/api/main-backend/qa/session/offline",
        JSON.stringify({ registerno: student?.registerno })
      );
      
      if (!beaconSent) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/main-backend/qa/session/offline", false);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(JSON.stringify({ registerno: student?.registerno }));
        } catch (err) {
          console.error("Failed to mark offline:", err);
        }
      }
    };

    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("unload", onUnload);
    window.addEventListener("pagehide", onUnload);

    return () => {
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("unload", onUnload);
      window.removeEventListener("pagehide", onUnload);
    };
  }, [student?.registerno]);

  // DISABLE CLIPBOARD
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

  // ✅ FIX #1: REAL OFFLINE/ONLINE HANDLING - Checks actual internet, not just adapter
  useEffect(() => {
    let checkInterval;

    const handleOffline = async () => {
      // Double-check with real internet ping
      const hasInternet = await checkRealInternet();
      
      if (!hasInternet && !offlineAlertShown.current) {
        offlineAlertShown.current = true;
        setIsOnline(false);

        // try {
        //   await axios.post("/api/main-backend/qa/session/offline");
        // } catch (err) {
        //   console.error("Failed to notify offline status:", err);
        // }

        Swal.fire({
          title: "Connection Lost",
          text: "Internet connection lost. Exam paused. Reconnect to continue.",
          icon: "warning",
          allowOutsideClick: false,
          showConfirmButton: false,
        });
      }
    };

    const handleOnline = async () => {
      // Verify real internet before resuming
      const hasInternet = await checkRealInternet();
      
      if (hasInternet && offlineAlertShown.current) {
        offlineAlertShown.current = false;
        setIsOnline(true);
        Swal.close();

        try {
          await axios.post("/api/main-backend/qa/session/resume");
          
          const res = await axios.get("/api/main-backend/qa/session/resume-data");
          setCurrent(res.data.currentQuestionIndex || 0);
          setSelected(res.data.selectedAnswers || {});
          setVisited(res.data.selectedAnswers || {});

          Swal.fire({
            title: "Reconnected",
            text: "Exam resumed successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          console.error("Failed to resume:", err);
        }
      }
    };

    // Listen to browser online/offline events
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Also poll real internet every 5 seconds
    checkInterval = setInterval(async () => {
      const hasInternet = await checkRealInternet();
      
      if (!hasInternet && !offlineAlertShown.current) {
        handleOffline();
      } else if (hasInternet && offlineAlertShown.current) {
        handleOnline();
      }
    }, 5000);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearInterval(checkInterval);
    };
  }, []);

  // VIOLATION TRACKING
  const registerViolation = async (type, message) => {
    try {
      const res = await axios.post("/api/main-backend/qa/session/violation", {
        type,
      });
      
      if (res.data.terminated) {
        forceExit({ reason: "Violation limit exceeded" });
        return;
      }

      setViolations({
        fullscreenExit: res.data.fullscreenExit || 0,
        tabSwitch: res.data.tabSwitch || 0,
      });
      
      Swal.fire({
        title: "⚠️ Warning",
        html: `
          <p>${message}</p>
          <p style="margin-top: 10px; color: #dc3545; font-weight: bold;">
            Total Violations: ${res.data.totalViolations}
          </p>
        `,
        icon: "warning",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Violation registration error:", err);
    }
  };

  // BACK NAVIGATION BLOCKING
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

  // KEYBOARD BLOCKING
  useEffect(() => {
    const blockKeyboard = (e) => {
      // Allow typing in radio buttons and other interactive elements
      const target = e.target;
      if (target.type === 'radio' || target.type === 'checkbox') {
        return;
      }
      
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

  // SELECTIVE KEYBOARD BLOCKING
  useEffect(() => {
    const blockDangerousKeys = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        return false;
      }

      if (e.ctrlKey && ["c", "v", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }

      if (e.key === "PrintScreen") {
        e.preventDefault();
        registerViolation("printScreen", "Screenshot attempt detected");
        return false;
      }
    };

    document.addEventListener("keydown", blockDangerousKeys, true);
    return () => document.removeEventListener("keydown", blockDangerousKeys, true);
  }, []);

  // FULLSCREEN ENFORCEMENT - Fixed to always show warning
  useEffect(() => {
    let isHandlingExit = false;

    const forceFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    // Enter fullscreen on first interaction
    document.addEventListener("click", forceFullscreen, { once: true });

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !isHandlingExit) {
        isHandlingExit = true;

        // 🚨 Register violation immediately
        registerViolation(
          "fullscreenExit",
          "Exited fullscreen mode"
        );

        // 🔒 Force fullscreen back instantly
        setTimeout(() => {
          forceFullscreen();
          isHandlingExit = false;
        }, 200); // small delay to avoid browser race condition
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [document.fullscreenElement]);

  // TAB SWITCH vs WINDOW BLUR - Properly differentiated
  useEffect(() => {
    let blurTimeout;

    const onWindowBlur = () => {
      // Set a short timeout to distinguish between blur and visibility change
      blurTimeout = setTimeout(() => {
        // Only trigger if page is still visible (meaning it's window blur, not tab switch)
        if (!document.hidden) {
          registerViolation("tabSwitch", "Focus lost - Did you switch windows?");
        }
      }, 100); // Small delay to let visibility change event fire first
    };

    const onWindowFocus = () => {
      // Clear timeout if focus returns quickly
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
    };

    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    
    return () => {
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      if (blurTimeout) clearTimeout(blurTimeout);
    };
  }, []);

  // ✅ TAB SWITCH DETECTION - Separate from window blur
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        registerViolation("tabSwitch", "Tab or window switch detected.");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // PREVENT TEXT SELECTION
  useEffect(() => {
    const preventSelection = (e) => e.preventDefault();
    document.addEventListener('selectstart', preventSelection);
    return () => document.removeEventListener('selectstart', preventSelection);
  }, []);

  // SCREENSHOT DETECTION
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

  // DISABLE RIGHT CLICK
  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);
    return () => document.removeEventListener("contextmenu", disableContextMenu);
  }, []);

  // AUTO SCROLL PROGRESS
  useEffect(() => {
    if (circleRefs.current[current]) {
      circleRefs.current[current].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [current]);

  // ACTIONS
  const forceExit = (data) => {
    Swal.fire({
      title: "Exam Ended",
      text: data.reason || data.message || "Your exam session is no longer active.",
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
    if (!selected[current]) {
      alertBox("Required", "Please select an option before continuing.", "info");
      return;
    }
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

      const res = await axios.post("/api/main-backend/studentresult", {
        scheduleId: exam.scheduleId
      });

      const { registerno, name, department, batch, totalMarks } = res.data;

      Swal.fire({
        title: "Exam Result",
        icon: "success",
        html: `
          <div style="text-align:left;font-size:15px">
            <p><b>Register No:</b> ${registerno}</p>
            <p><b>Name:</b> ${name}</p>
            <p><b>Department:</b> ${department}</p>
            <p><b>Year:</b> ${batch}</p>
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

  // UI
  return (
    <>
      <div className="z-50 bg-white border-b shadow-sm">
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

          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${
              isOnline
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500 animate-pulse"
              }`}></span>
            {isOnline ? "Online" : "Offline"}
            {!isOnline && <span className="ml-1 text-xs font-medium">(Paused)</span>}
          </div>
        </div>
      </div>

      <div className="quest_page relative select-none" style={{ paddingTop: "20px" }}>
        <div className="quest_left">
          <h2 className="quest_title">Question</h2>
          <h3 className="quest_question">
            {q?.id}. {q?.question}
          </h3>
        </div>

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
                  disabled={!isOnline}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          <div className="quest_button_area">
            {current < questions.length - 1 ? (
              <button className="quest_btn_next" onClick={nextQuestion} disabled={loading || !isOnline}>
                {loading ? "Saving..." : "Next"}
              </button>
            ) : (
              <button className="quest_btn_submit" onClick={() => submitExam()} disabled={loading || !isOnline}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </div>

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