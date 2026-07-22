import { useEffect, useState, useRef, useCallback } from "react";
import "./NotifyCards.css";


const isEmptyPath = (val) =>
  val === null ||
  val === undefined ||
  val === "" ||
  val === "null" ||
  val === "undefined";


const normalizeSlide = (raw) => {
  if (!raw) return raw;

  const type = raw.type || (!isEmptyPath(raw.pdf_path) ? "pdf" : "image");

  const primary = type === "pdf" ? raw.pdf_path : raw.image_path;
  const image_path = !isEmptyPath(primary)
    ? primary
    : !isEmptyPath(raw.image_path)
    ? raw.image_path
    : !isEmptyPath(raw.pdf_path)
    ? raw.pdf_path
    : "";

  const is_active =
    typeof raw.is_active === "boolean"
      ? raw.is_active
      : raw.active === true || raw.active === "True" || raw.active === "true";

  return { ...raw, type, image_path, is_active };
};

const NotifyCard = ({ onClose = () => {}, data = [] }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [idx, setIdx] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const [modalStyle, setModalStyle] = useState({});
  const autoTimerRef = useRef(null);
  const imageLoaderRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    if (!data || !data.length) {
      setSlides([]);
      return;
    }
   
    const active = data
      .map(normalizeSlide)
      .filter((s) => s.is_active && !isEmptyPath(s.image_path));
    setSlides(active);
    setIdx(0);
  }, [data]);

  useEffect(() => {
    if (!visible) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, scrollY);
    };
  }, [visible]);

  const showArrows = slides.length > 1;

  const BASE_URL = process.env.REACT_APP_BASE_URL || "";

  
  const UrlParser = (path) => {
    if (isEmptyPath(path)) return "";
    if (path.startsWith("http")) return path;

    const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    const rel = path.startsWith("/") ? path : `/${path}`;
    return `${base}${rel}`;
  };

  useEffect(() => {
    if (!slides.length) return;

    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, [slides.length]);

  const handleClose = useCallback(
    (e) => {
      e && e.stopPropagation();

      if (closing) return;

      setClosing(true);

      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }

      closeTimerRef.current = setTimeout(() => {
        setVisible(false);
        setClosing(false);
        try {
          onClose();
        } catch (err) {}
      }, 420);
    },
    [onClose, closing]
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (imageLoaderRef.current) {
        imageLoaderRef.current.onload = null;
        imageLoaderRef.current.onerror = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!visible || closing || slides.length <= 1) return;

    const onKey = (e) => {
      if (e.key === "ArrowLeft") {
        setIdx((s) => (s === 0 ? slides.length - 1 : s - 1));
      }
      if (e.key === "ArrowRight") {
        setIdx((s) => (s + 1) % slides.length);
      }
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, closing, slides.length, handleClose]);

  useEffect(() => {
    if (!visible || closing || slides.length <= 1) return;

    if (isHover) {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      return;
    }

    const AUTO_MS = 4000;
    autoTimerRef.current = setTimeout(() => {
      setIdx((s) => (s + 1) % slides.length);
    }, AUTO_MS);

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [visible, closing, idx, isHover, slides.length]);

  const adjustModalSize = useCallback(() => {
    if (!slides.length) return;

    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    const maxWidth = Math.min(1100, Math.round(vw * 0.92));
    const maxHeight = Math.round(vh * 0.86);

    const minWidth = 320;
    const minHeight = 360;

    const slide = slides[idx];
    if (!slide) return;

    if (slide.type === "image" && !isEmptyPath(slide.image_path)) {
      const img = new Image();
      imageLoaderRef.current = img;

      img.onload = () => {
        const naturalW = img.naturalWidth || 1;
        const naturalH = img.naturalHeight || 1;
        const aspect = naturalW / naturalH;

        let desiredHeight = Math.min(
          maxHeight,
          Math.max(minHeight, Math.round(maxHeight * 0.95))
        );
        let desiredWidth = Math.round(desiredHeight * aspect);

        if (desiredWidth > maxWidth) {
          desiredWidth = maxWidth;
          desiredHeight = Math.round(desiredWidth / aspect);
        }

        if (desiredWidth < minWidth) {
          desiredWidth = minWidth;
        }

        setModalStyle({
          width: `${desiredWidth}px`,
        });
      };

      img.onerror = () => {
        setModalStyle({
          width: `${Math.min(520, maxWidth)}px`,
          height: `${Math.min(maxHeight, 800)}px`,
        });
      };

      img.src = UrlParser(slide.image_path);
    } else {
      setModalStyle({});
    }
  }, [idx, slides]);

  useEffect(() => {
    if (!visible || closing) return;

    adjustModalSize();

    return () => {
      if (imageLoaderRef.current) {
        imageLoaderRef.current.onload = null;
        imageLoaderRef.current.onerror = null;
        imageLoaderRef.current = null;
      }
    };
  }, [visible, closing, idx, adjustModalSize]);

  useEffect(() => {
    if (!visible || closing) return;

    const onResize = () => adjustModalSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [visible, closing, adjustModalSize]);

  const next = (e) => {
    e && e.stopPropagation();
    if (slides.length <= 1) return;
    setIdx((s) => (s + 1) % slides.length);
  };

  const prev = (e) => {
    e && e.stopPropagation();
    if (slides.length <= 1) return;
    setIdx((s) => (s === 0 ? slides.length - 1 : s - 1));
  };

  const onEnter = () => setIsHover(true);
  const onLeave = () => setIsHover(false);

  if (!visible || !slides.length) return null;

  const currentSlide = slides[idx];
  if (!currentSlide) return null;

  const isImage = currentSlide.type === "image";

  return (
    <div
      className={`nc-overlay ${closing ? "nc-hide" : "nc-show"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Media popup"
      onClick={handleClose}
    >
      <div
        className={`nc-modal ${isImage ? "nc-modal--image" : "nc-modal--pdf"}`}
        style={isImage ? modalStyle : undefined}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="nc-close" onClick={handleClose} aria-label="Close popup">
          ×
        </button>

        {showArrows && (
          <button className="nc-arrow nc-arrow--left" onClick={prev} aria-label="Previous slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <div className="nc-media">
          {isImage ? (
            <img src={UrlParser(currentSlide.image_path)} alt={`slide-${idx + 1}`} className="nc-media-content" draggable="false" />
          ) : (
            <iframe src={`${UrlParser(currentSlide.image_path)}#toolbar=0&navpanes=0&scrollbar=1`} title="pdf" className="nc-media-content" />
          )}
        </div>

        {showArrows && (
          <button className="nc-arrow nc-arrow--right" onClick={next} aria-label="Next slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default NotifyCard;