import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Old from "./Layouts/Old";
import New from "./Layouts/New";
import axios from "axios";
import { useLocation, useNavigate } from "react-router";

const ExamPDF = () => {
  const componentReference = useRef(null);
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) {
      navigate("/qp", { replace: true });
    }
  }, [state, navigate]);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  
  useEffect(() => {
    if (!state) return;

    const storageKey = `exam_questions_${state.subjectCode}_${state.set}_${state.exam}`;

    const cached = sessionStorage.getItem(storageKey);
    if (cached) {
      setQuestions(JSON.parse(cached));
      return;
    }

    const fethData = async () => {
      const examTypeMap = {
        I: "cie1",
        II: "cie2",
        III: "cie3",
      };

      try {
        const response = await axios.post(
          "/api/main-backend/questionbank_generator",
          {
            examType: examTypeMap[state.exam],
            subjectcode: state.subjectCode,
            set: state.set,
          }
        );

        setQuestions(response.data);
        sessionStorage.setItem(storageKey, JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching Questions", error);
      }
    };

    fethData();
  }, [state]);
  
  if (!state) return null;

  const downloadPdf = async () => {
    const element = componentReference.current;
    if (!element) return;
    setLoading(true);
    
    let pagerWrapper = null;
    
    try {
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true
      });
      const pageWidthMM = pdf.internal.pageSize.getWidth();
      const pageHeightMM = pdf.internal.pageSize.getHeight();
      const marginMM = 15;
      const printableWidthMM = pageWidthMM - marginMM * 2;
      const printableHeightMM = pageHeightMM - marginMM * 2;

      // Create wrapper off-screen to render cloned DOM
      pagerWrapper = document.createElement("div");
      pagerWrapper.style.position = "fixed";
      pagerWrapper.style.left = "-9999px";
      pagerWrapper.style.top = "0";
      pagerWrapper.style.width = `${element.offsetWidth}px`;
      pagerWrapper.style.backgroundColor = "#ffffff";
      pagerWrapper.style.padding = "0";
      pagerWrapper.style.margin = "0";
      pagerWrapper.style.boxSizing = "border-box";
      document.body.appendChild(pagerWrapper);

      // Clone element to avoid reflow of real page
      const cloned = element.cloneNode(true);

      // Make sure cloned styles match visually
      cloned.style.margin = "0";
      cloned.style.padding = "0";
      cloned.style.boxSizing = "border-box";
      cloned.style.width = `${element.offsetWidth}px`;
      cloned.style.backgroundColor = "#ffffff";

      cloned.querySelectorAll("tr").forEach(tr => tr.classList.add("no-break"));

      pagerWrapper.appendChild(cloned);

      // Wait for fonts to be ready (if supported)
      if (document.fonts && document.fonts.ready) await document.fonts.ready;

      // Add CSS to cloned to reduce unexpected breaks (mostly for visual parity)
      const style = document.createElement("style");
      style.textContent = `
        /* ONLY PAGE BREAK SAFETY */
        .no-break {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
        }

        .part-b-block {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        tr {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        body {
          background: #ffffff !important;
        }

        header {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .reg {
          padding-bottom: 15px;
        }

        .he th {
          padding-bottom: 5px;
        }
      `;
      pagerWrapper.appendChild(style);

      // Ensure all images load
      await Promise.all(
        Array.from(cloned.querySelectorAll("img")).map(img => {
          if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
          return new Promise(res => { img.onload = img.onerror = res; });
        })
      );

      // Render whole cloned node to canvas
      // const scale = window.devicePixelRatio || 2;
      const canvas = await html2canvas(cloned, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          clonedDoc.body.style.backgroundColor = "#ffffff";
        }
      });

      const domToCanvas = canvas.width / cloned.offsetWidth; // canvas px per DOM px
      const pxPerMM = canvas.width / printableWidthMM; // canvas px per mm based on width mapping
      const printableHeightPx = printableHeightMM * pxPerMM;
      const totalHeightPx = canvas.height;

      const parentRect = cloned.getBoundingClientRect();

      // Build array of safe cut positions from .no-break elements (bottom offsets in canvas pixels)
      const atomicBlocks = Array.from(
        cloned.querySelectorAll('[data-atomic="true"]')
      );

      const safeRects = [];

      // 1️⃣ Add atomic blocks FIRST
      atomicBlocks.forEach(el => {
        const r = el.getBoundingClientRect();
        const topPxDom = r.top - parentRect.top;
        const bottomPxDom = r.bottom - parentRect.top;

        safeRects.push({
          topPxCanvas: Math.round(topPxDom * domToCanvas),
          bottomPxCanvas: Math.round(bottomPxDom * domToCanvas),
          atomic: true
        });
      });

      // 2️⃣ Add other no-break elements EXCEPT those inside atomic blocks
      Array.from(cloned.querySelectorAll('.no-break')).forEach(el => {
        if (el.closest('[data-atomic="true"]')) return; // 🚫 IGNORE inner rows

        const r = el.getBoundingClientRect();
        const topPxDom = r.top - parentRect.top;
        const bottomPxDom = r.bottom - parentRect.top;

        safeRects.push({
          topPxCanvas: Math.round(topPxDom * domToCanvas),
          bottomPxCanvas: Math.round(bottomPxDom * domToCanvas),
          atomic: false
        });
      });

      // Sort safeRects by position just in case
      safeRects.sort((a, b) => a.topPxCanvas - b.topPxCanvas);

      // Build slices positions using safe boundaries
      const tolerance = Math.round(6 * domToCanvas); // small tolerance in canvas px to avoid tiny slivers
      let startY = 0;
      const slicesPositions = [];

      while (startY < totalHeightPx - 1) {
        const pageBottom = startY + printableHeightPx;
        // find the last safe rect bottom <= pageBottom - tolerance
        const candidates = safeRects.filter(r => r.bottomPxCanvas <= pageBottom - tolerance && r.bottomPxCanvas > startY + 1);
        if (candidates.length > 0) {
          const cutAt = candidates[candidates.length - 1].bottomPxCanvas;
          // If cutAt is too close to startY, avoid infinitesimal slice - advance by printableHeightPx instead
          if (cutAt - startY < 8) {
            // fallback to fixed-height page
            slicesPositions.push({ start: startY, height: Math.min(printableHeightPx, totalHeightPx - startY) });
            startY += printableHeightPx;
          } else {
            slicesPositions.push({ start: startY, height: cutAt - startY });
            startY = cutAt;
          }
        } else {
          // No safe cut inside this page
          // Find next safe rect after startY
          const nextSafe = safeRects.find(r => r.topPxCanvas > startY);
          if (!nextSafe) {
            // No more safe rects -> take the rest
            slicesPositions.push({ start: startY, height: totalHeightPx - startY });
            break;
          }
          // If the next safe element itself is taller than a page, we must split it
          if (nextSafe.topPxCanvas - startY >= printableHeightPx) {
            // split fixed
            slicesPositions.push({ start: startY, height: printableHeightPx });
            startY += printableHeightPx;
          } else {
            // cut just before that next element so we don't split it (may leave some white space)
            const cutAt = Math.max(nextSafe.topPxCanvas, startY + 1);
            slicesPositions.push({ start: startY, height: cutAt - startY });
            startY = cutAt;
          }
        }

        // Safety: avoid infinite loop
        if (slicesPositions.length > 500) break;
      }

      // If no slices were created (edge case), fallback to simple slicing
      if (slicesPositions.length === 0) {
        const simpleSlices = Math.ceil(totalHeightPx / printableHeightPx);
        for (let i = 0; i < simpleSlices; i++) {
          const s = i * printableHeightPx;
          const h = Math.min(printableHeightPx, totalHeightPx - s);
          slicesPositions.push({ start: s, height: h });
        }
      }

      // Now produce each page image and add to PDF
      for (let i = 0; i < slicesPositions.length; i++) {
        const s = slicesPositions[i];
        if (!s || s.height <= 2) continue; // skip negligible slices
        if (!s || s.height <= Math.round(6 * domToCanvas)) continue;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = s.height;
        const ctx = sliceCanvas.getContext("2d");

        // draw the slice from the large canvas
        ctx.drawImage(
          canvas,
          0, s.start, canvas.width, s.height,
          0, 0, canvas.width, s.height
        );

        const imgData = sliceCanvas.toDataURL("image/jpeg", 0.85);
        const imgHeightMM = s.height / pxPerMM;

        if (i === 0) {
          pdf.addImage(imgData, "JPEG", marginMM, marginMM, printableWidthMM, imgHeightMM);
        } else {
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", marginMM, marginMM, printableWidthMM, imgHeightMM);
        }

        // cleanup
        ctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      }

      // Cleanup DOM wrapper
      if (pagerWrapper && pagerWrapper.parentNode) {
        pagerWrapper.parentNode.removeChild(pagerWrapper);
      }

      const paperName = `${state?.subject}_${state?.set}.pdf`

      pdf.save(paperName);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. See console for details.");
      // Ensure we still cleanup wrapper
      if (pagerWrapper && pagerWrapper.parentNode) {
        pagerWrapper.parentNode.removeChild(pagerWrapper);
      }
    } finally {
      // Final cleanup and state reset
      if (pagerWrapper && pagerWrapper.parentNode) {
        pagerWrapper.parentNode.removeChild(pagerWrapper);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-6">
        
      </div>
      <div className="my-10 font-rome">
        {/* captured div */}
        <New ref={componentReference} data={questions} state={state}/>

        <div className="flex w-fit mx-auto gap-4">
          <div className="w-fit p-2 px-2 rounded bg-secd hover:bg-brwn text-text hover:text-prim mx-auto mt-4">
            <button onClick={() => {
                      const storageKey = `exam_questions_${state.subjectCode}_${state.set}_${state.exam}`;
                      sessionStorage.removeItem(storageKey);
                      navigate("/qp", { state });
                    }}
                    className="flex flex-row gap-2 items-center px-3 py-2 rounded" type="button"
            >
              <ArrowLeft />Back to Edit
            </button>
          </div>
          <div className="w-fit p-2 px-2 rounded bg-secd hover:bg-brwn text-text hover:text-prim mx-auto mt-4">
            <button
              type="button"
              onClick={downloadPdf}
              disabled={loading}
              className={`flex flex-row gap-2 items-center px-3 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75" />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <Download /> Download
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default ExamPDF;
