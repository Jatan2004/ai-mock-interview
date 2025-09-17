"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

type FeedbackCategory = { name: string; score: number; comment?: string };
type FeedbackData = {
  totalScore?: number;
  createdAt?: string | number | Date;
  finalAssessment?: string;
  categoryScores?: FeedbackCategory[];
  strengths?: string[];
  areasForImprovement?: string[];
  [key: string]: unknown;
};

type DownloadFeedbackPdfButtonProps = {
  feedback: FeedbackData | null | undefined;
  interviewRole?: string;
  className?: string;
};

function loadHtml2Pdf(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("window undefined"));
    const w = window as unknown as { html2pdf?: any };
    if (w.html2pdf) return resolve(w.html2pdf);
    const src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    const existing = document.querySelector(`script[src='${src}']`) as HTMLScriptElement | null;
    const attachHandlers = (el: HTMLScriptElement) => {
      el.addEventListener("load", () => resolve((window as any).html2pdf));
      el.addEventListener("error", () => reject(new Error("Failed to load html2pdf.js")));
    };
    if (existing) {
      if ((window as any).html2pdf) return resolve((window as any).html2pdf);
      attachHandlers(existing);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    attachHandlers(script);
    document.body.appendChild(script);
  });
}

async function loadJsPdf(): Promise<any> {
  if (typeof window === "undefined") throw new Error("window undefined");
  const w = window as any;
  if (w.jspdf?.jsPDF) return w.jspdf.jsPDF;
  const src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  const existing = document.querySelector(`script[src='${src}']`) as HTMLScriptElement | null;
  const load = () => new Promise<void>((resolve, reject) => {
    const target = existing ?? Object.assign(document.createElement("script"), { src, async: true });
    target.addEventListener("load", () => resolve());
    target.addEventListener("error", () => reject(new Error("Failed to load jsPDF")));
    if (!existing) document.body.appendChild(target);
  });
  await load();
  if (!w.jspdf?.jsPDF) throw new Error("jsPDF not available after load");
  return w.jspdf.jsPDF;
}

const DownloadFeedbackPdfButton = ({ feedback, interviewRole, className }: DownloadFeedbackPdfButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const handleDownloadPdf = useCallback(async () => {
    if (!feedback || isGenerating) return;
    setIsGenerating(true);
    let html2pdf: any;
    try {
      html2pdf = await loadHtml2Pdf();
    } catch (e) {
      console.error(e);
      alert("Failed to load PDF generator. Please check your network and try again.");
      setIsGenerating(false);
      return;
    }
    const title = `${interviewRole ? interviewRole + " " : ""}Interview Feedback`;

    const safe = (val: unknown) => (val == null ? "" : String(val));

    const categoriesHtml = (feedback.categoryScores || [])
      .map((c, i) => `<div style=\"margin-bottom:8px;\"><strong>${i + 1}. ${safe(c.name)} (${safe(c.score)}/100)</strong><div>${safe(c.comment)}</div></div>`) 
      .join("");

    const list = (items?: string[]) => (items && items.length)
      ? `<ul style=\"margin:4px 0 0 16px;\">${items.map((s) => `<li>${safe(s)}</li>`).join("")}</ul>`
      : "<div>—</div>";

    const createdAt = feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : "N/A";

    const html = `
      <div style=\"font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; padding: 16px; color: #111;\">
        <h1 style=\"font-size: 20px; margin: 0 0 8px;\">${title}</h1>
        <div style=\"margin-bottom: 12px;\">
          <div><strong>Overall Impression:</strong> ${safe(feedback.totalScore)}/100</div>
          <div><strong>Date:</strong> ${createdAt}</div>
        </div>
        <div style=\"margin-bottom: 12px;\">
          <h2 style=\"font-size: 16px; margin: 0 0 6px;\">Summary</h2>
          <div>${safe(feedback.finalAssessment)}</div>
        </div>
        <div style=\"margin-bottom: 12px;\">
          <h2 style=\"font-size: 16px; margin: 0 0 6px;\">Breakdown</h2>
          ${categoriesHtml}
        </div>
        <div style=\"margin-bottom: 12px;\">
          <h2 style=\"font-size: 16px; margin: 0 0 6px;\">Strengths</h2>
          ${list(feedback.strengths as string[] | undefined)}
        </div>
        <div>
          <h2 style=\"font-size: 16px; margin: 0 0 6px;\">Areas for Improvement</h2>
          ${list(feedback.areasForImprovement as string[] | undefined)}
        </div>
      </div>
    `;

    const filenameBase = interviewRole ? `${interviewRole.toLowerCase().replace(/\\s+/g, "-")}-feedback` : "feedback";
    const fileName = `${filenameBase}.pdf`;

    try {
      await html2pdf()
        .from(html)
        .set({
          margin: 10,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save();
    } catch (e) {
      console.warn("html2pdf failed, falling back to jsPDF", e);
      // Fallback: simple text PDF via jsPDF
      try {
        const JsPDF = await loadJsPdf();
        const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
        const lineHeight = 6;
        const left = 12;
        const right = 198; // 210 - 12
        let y = 14;

        const addLine = (text: string, bold = false) => {
          if (bold) doc.setFont(undefined, "bold"); else doc.setFont(undefined, "normal");
          const splitted = doc.splitTextToSize(text, right - left);
          splitted.forEach((line: string) => {
            if (y > 280) { doc.addPage(); y = 14; }
            doc.text(line, left, y);
            y += lineHeight;
          });
        };

        addLine(`${title}`, true);
        addLine(`Overall Impression: ${String(feedback.totalScore ?? "N/A")}/100`);
        addLine(`Date: ${createdAt}`);
        y += 2;
        addLine("Summary", true);
        addLine(String(feedback.finalAssessment ?? ""));
        y += 2;
        addLine("Breakdown", true);
        (feedback.categoryScores || []).forEach((c: any, i: number) => {
          addLine(`${i + 1}. ${String(c.name)} (${String(c.score)}/100)`, true);
          if (c.comment) addLine(String(c.comment));
        });
        y += 2;
        addLine("Strengths", true);
        (feedback.strengths || []).forEach((s: string) => addLine(`• ${s}`));
        y += 2;
        addLine("Areas for Improvement", true);
        (feedback.areasForImprovement || []).forEach((s: string) => addLine(`• ${s}`));

        doc.save(fileName);
      } catch (err) {
        console.error("Both html2pdf and jsPDF fallback failed", err);
        alert("Failed to generate PDF. Try again or refresh the page.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [feedback, interviewRole, isGenerating]);

  return (
    <button type="button" onClick={handleDownloadPdf} className={cn("btn-primary flex-1", className)} aria-label="Download feedback as PDF" disabled={isGenerating}>
      <span className="flex w-full justify-center text-sm font-semibold text-black">{isGenerating ? "Generating…" : "Download PDF"}</span>
    </button>
  );
};

export default DownloadFeedbackPdfButton;


