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
      console.error("Failed to load html2pdf", e);
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          
          .content {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
          }
          
          .content-top-border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid #f3f4f6;
          }
          
          .title {
            font-size: 32px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
          }
          
          .subtitle {
            font-size: 18px;
            color: #6b7280;
            font-weight: 400;
          }
          
          .score-section {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: center;
            border: 1px solid #e5e7eb;
          }
          
          .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            position: relative;
          }
          
          .score-circle-inner {
            position: absolute;
            inset: 4px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .score-text {
            font-size: 36px;
            font-weight: 700;
            color: #1f2937;
            position: relative;
            z-index: 1;
          }
          
          .score-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .date-info {
            font-size: 16px;
            color: #6b7280;
            margin-top: 8px;
          }
          
          .section {
            margin-bottom: 32px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
            position: relative;
          }
          
          .section-title-accent {
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 40px;
            height: 2px;
            background: linear-gradient(90deg, #667eea, #764ba2);
          }
          
          .summary-text {
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          
          .category-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 12px;
            position: relative;
          }
          
          .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .category-name {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .category-score {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          
          .category-comment {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
          }
          
          .progress-bar {
            width: 100%;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 8px;
          }
          
          .progress-fill {
            height: 100%;
            background: #667eea;
            border-radius: 3px;
          }
          
          .list-container {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #e5e7eb;
          }
          
          .list-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            font-size: 15px;
            color: #374151;
            line-height: 1.6;
          }
          
          .list-item:last-child {
            margin-bottom: 0;
          }
          
          .list-bullet {
            width: 6px;
            height: 6px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            margin-right: 12px;
            margin-top: 8px;
            flex-shrink: 0;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          
          .logo {
            font-size: 18px;
            font-weight: 700;
            color: #667eea;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="content-top-border"></div>
            <div class="header">
              <h1 class="title">${title}</h1>
              <p class="subtitle">Interview Performance Analysis</p>
            </div>
            
            <div class="score-section">
              <div class="score-circle">
                <div class="score-circle-inner"></div>
                <div class="score-text">${safe(feedback.totalScore)}</div>
              </div>
              <div class="score-label">Overall Score</div>
              <div class="date-info">Generated on ${createdAt}</div>
            </div>
            
            <div class="section">
              <h2 class="section-title">Executive Summary<div class="section-title-accent"></div></h2>
              <div class="summary-text">${safe(feedback.finalAssessment)}</div>
            </div>
            
            <div class="section">
              <h2 class="section-title">Performance Breakdown<div class="section-title-accent"></div></h2>
              ${(feedback.categoryScores || []).map((c, i) => `
                <div class="category-item">
                  <div class="category-header">
                    <span class="category-name">${i + 1}. ${safe(c.name)}</span>
                    <span class="category-score">${safe(c.score)}/100</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${safe(c.score)}%"></div>
                  </div>
                  ${c.comment ? `<div class="category-comment">${safe(c.comment)}</div>` : ''}
                </div>
              `).join('')}
            </div>
            
            <div class="section">
              <h2 class="section-title">Key Strengths<div class="section-title-accent"></div></h2>
              <div class="list-container">
                ${(feedback.strengths || []).map(s => `
                  <div class="list-item">
                    <div class="list-bullet"></div>
                    <span>${safe(s)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">Areas for Improvement<div class="section-title-accent"></div></h2>
              <div class="list-container">
                ${(feedback.areasForImprovement || []).map(s => `
                  <div class="list-item">
                    <div class="list-bullet"></div>
                    <span>${safe(s)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="footer">
              <div class="logo">AI Mock Interviews</div>
              <p>Professional interview feedback powered by AI</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const filenameBase = interviewRole ? `${interviewRole.toLowerCase().replace(/\\s+/g, "-")}-feedback` : "feedback";
    const fileName = `${filenameBase}.pdf`;

    let tempIframe: HTMLIFrameElement | null = null;
    
    try {
      // Create a hidden iframe to render the HTML without affecting the page
      tempIframe = document.createElement('iframe');
      tempIframe.style.position = 'fixed';
      tempIframe.style.width = '1px';
      tempIframe.style.height = '1px';
      tempIframe.style.left = '-9999px';
      tempIframe.style.top = '-9999px';
      tempIframe.style.border = 'none';
      tempIframe.style.opacity = '0';
      tempIframe.style.pointerEvents = 'none';
      document.body.appendChild(tempIframe);
      
      const iframeDoc = tempIframe.contentDocument || tempIframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not create iframe document');
      }
      
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      
      // Wait for iframe to load
      await new Promise((resolve) => {
        if (tempIframe?.contentWindow) {
          tempIframe.contentWindow.onload = resolve;
        } else {
          setTimeout(resolve, 1000);
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate PDF from the iframe
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            letterRendering: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 794,
            windowHeight: 1123
          },
          jsPDF: { 
            unit: "mm", 
            format: "a4", 
            orientation: "portrait",
            compress: true
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        })
        .from(iframeDoc.body)
        .save();
      
    } catch (e) {
      console.warn("html2pdf failed, falling back to jsPDF", e);
      // Fallback: enhanced text PDF via jsPDF
      try {
        const JsPDF = await loadJsPdf();
        const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
        
        // Set up colors
        const primaryColor = [102, 126, 234]; // #667eea
        const secondaryColor = [118, 75, 162]; // #764ba2
        const textColor = [31, 41, 55]; // #1f2937
        const lightGray = [107, 114, 128]; // #6b7280
        const bgGray = [249, 250, 251]; // #f9fafb
        
        const lineHeight = 6;
        const left = 15;
        const right = 195; // 210 - 15
        let y = 20;

        const addLine = (text: string, bold = false, fontSize = 12, color = textColor) => {
          doc.setFontSize(fontSize);
          doc.setTextColor(color[0], color[1], color[2]);
          if (bold) doc.setFont(undefined, "bold"); else doc.setFont(undefined, "normal");
          const splitted = doc.splitTextToSize(text, right - left);
          splitted.forEach((line: string) => {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.text(line, left, y);
            y += lineHeight;
          });
        };

        const addSection = (title: string, yOffset = 8) => {
          y += yOffset;
          addLine(title, true, 16, primaryColor);
          y += 2;
        };

        const addScoreCircle = () => {
          // Draw score circle
          const centerX = 105;
          const centerY = y + 15;
          const radius = 20;
          
          // Outer circle with gradient effect
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.circle(centerX, centerY, radius, 'F');
          
          // Inner white circle
          doc.setFillColor(255, 255, 255);
          doc.circle(centerX, centerY, radius - 3, 'F');
          
          // Score text
          doc.setFontSize(24);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFont(undefined, "bold");
          const scoreText = String(feedback.totalScore ?? "N/A");
          const textWidth = doc.getTextWidth(scoreText);
          doc.text(scoreText, centerX - textWidth/2, centerY + 2);
          
          y += 40;
        };

        // Header
        addLine("AI MOCK INTERVIEWS", true, 14, lightGray);
        y += 4;
        addLine(title, true, 20, primaryColor);
        y += 2;
        addLine("Interview Performance Analysis", false, 12, lightGray);
        y += 8;

        // Score section
        addScoreCircle();
        addLine("Overall Score", true, 12, lightGray);
        addLine(`Generated on ${createdAt}`, false, 10, lightGray);
        y += 8;

        // Summary section
        addSection("Executive Summary");
        addLine(String(feedback.finalAssessment ?? ""), false, 11);

        // Breakdown section
        addSection("Performance Breakdown");
        (feedback.categoryScores || []).forEach((c: any, i: number) => {
          addLine(`${i + 1}. ${String(c.name)}`, true, 12);
          addLine(`Score: ${String(c.score)}/100`, false, 10, lightGray);
          if (c.comment) {
            addLine(String(c.comment), false, 10);
          }
          y += 2;
        });

        // Strengths section
        addSection("Key Strengths");
        (feedback.strengths || []).forEach((s: string) => addLine(`• ${s}`, false, 11));

        // Areas for improvement section
        addSection("Areas for Improvement");
        (feedback.areasForImprovement || []).forEach((s: string) => addLine(`• ${s}`, false, 11));

        // Footer
        y += 10;
        addLine("─".repeat(50), false, 10, lightGray);
        y += 4;
        addLine("AI Mock Interviews - Professional interview feedback powered by AI", false, 10, lightGray);

        doc.save(fileName);
      } catch (err) {
        console.error("Both html2pdf and jsPDF fallback failed", err);
        alert("Failed to generate PDF. Try again or refresh the page.");
      }
    } finally {
      // Clean up iframe if it exists
      if (tempIframe && tempIframe.parentNode) {
        tempIframe.parentNode.removeChild(tempIframe);
      }
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


