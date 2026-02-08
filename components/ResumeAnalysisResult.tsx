"use client";

import { CheckCircle2, XCircle, Search, Target, Layout, ListChecks, ArrowLeft, AlertCircle, Loader2, Sparkles, GraduationCap, FileDown, BookOpen, Quote, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { generateCoverLetter } from "@/lib/actions/resume.action";
import { toast } from "sonner";

interface AnalysisResultProps {
    analysis: {
        atsScore: number;
        summary: string;
        sections: Array<{ name: string; score: number; feedback: string }>;
        strengths: string[];
        weaknesses: string[];
        missingKeywords: string[];
        formattingFeedback: string;
        quantifiableAchievements: string[];
        finalVerdict: string;
        jdMatch?: {
            percentage: number;
            missingSkills: string[];
            missingKeywords: string[];
            recommendation: string;
        };
        optimizedBullets: Array<{
            original: string;
            optimized: string;
            reason: string;
        }>;
        radarSkills: {
            technical: number;
            leadership: number;
            softSkills: number;
            industryKnowledge: number;
            communication: number;
        };
        learningPath: Array<{
            skill: string;
            roadmap: string[];
            projectIdea: string;
        }>;
        benchmarking: {
            percentile: number;
            standing: string;
            comparisonPoints: string[];
        };
    };
    onReset: () => void;
}

const ResumeAnalysisResult = ({ analysis, onReset }: AnalysisResultProps) => {
    const [isGeneratingCL, setIsGeneratingCL] = useState(false);
    const [coverLetter, setCoverLetter] = useState<string | null>(null);
    const [showCLModal, setShowCLModal] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-success-100";
        if (score >= 60) return "text-primary-200";
        return "text-destructive-100";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-success-100/10 border-success-100/20";
        if (score >= 60) return "bg-primary-200/10 border-primary-200/20";
        return "bg-destructive-100/10 border-destructive-100/20";
    };

    const RadarChart = () => {
        const skills = [
            { label: "Technical", value: analysis.radarSkills.technical },
            { label: "Leadership", value: analysis.radarSkills.leadership },
            { label: "Soft Skills", value: analysis.radarSkills.softSkills },
            { label: "Industry", value: analysis.radarSkills.industryKnowledge },
            { label: "Comm.", value: analysis.radarSkills.communication },
        ];

        const size = 300;
        const center = size / 2;
        const radius = size * 0.4;
        const angleStep = (Math.PI * 2) / skills.length;

        const points = skills.map((skill, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = (skill.value / 100) * radius;
            return {
                x: center + r * Math.cos(angle),
                y: center + r * Math.sin(angle),
                labelX: center + (radius + 20) * Math.cos(angle),
                labelY: center + (radius + 20) * Math.sin(angle),
            };
        });

        const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

        // Background circles
        const gridCircles = [0.2, 0.4, 0.6, 0.8, 1].map((step, i) => (
            <circle
                key={i}
                cx={center}
                cy={center}
                r={radius * step}
                className="fill-none stroke-black/5 dark:stroke-white/10 transition-colors duration-500"
                strokeWidth="1"
            />
        ));

        // Axis lines
        const axisLines = points.map((p, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const endX = center + radius * Math.cos(angle);
            const endY = center + radius * Math.sin(angle);
            return <line key={i} x1={center} y1={center} x2={endX} y2={endY} className="stroke-black/5 dark:stroke-white/10 transition-colors duration-500" strokeWidth="1" />;
        });

        return (
            <div className="flex flex-col items-center">
                <svg width={size} height={size} className="overflow-visible">
                    {gridCircles}
                    {axisLines}
                    <path
                        d={polygonPath}
                        className="fill-primary-200/20 stroke-primary-200"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r="3" className="fill-primary-100" />
                            <text
                                x={p.labelX}
                                y={p.labelY}
                                textAnchor="middle"
                                className="text-[10px] fill-dark-100 dark:fill-light-100 font-medium transition-colors duration-500"
                            >
                                {skills[i].label}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col gap-8 animate-fadeIn print:bg-dark-100 print:w-full print:max-w-none print:m-0 print:p-8">
            {/* Ultra-High Fidelity Dark Mode Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    html, body {
                        background-color: #030712 !important;
                        color: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        height: 100%;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print\\:hidden { display: none !important; }
                    .card, .p-6, .p-8 {
                        background-color: #111827 !important;
                        border: 1px solid rgba(255,255,255,0.1) !important;
                        break-inside: avoid;
                        border-radius: 1rem !important;
                    }
                    h2, h3, h4, span, p, li, text {
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                    .text-primary-200, .text-success-100, .text-primary-100 {
                        color: #6366f1 !important; /* Force readable indigo for print */
                    }
                    .bg-primary-200\\/10 { background-color: rgba(99, 102, 241, 0.1) !important; }
                    .bg-success-100\\/10 { background-color: rgba(34, 197, 94, 0.1) !important; }
                    .bg-dark-300\\/50 { background-color: #1f2937 !important; }
                    
                    /* Specific overrides for radar and progress bars */
                    svg circle { stroke: rgba(255,255,255,0.1) !important; }
                    svg line { stroke: rgba(255,255,255,0.1) !important; }
                    .bg-dark-300 { background-color: #1f2937 !important; }
                }
            `}} />

            <div className="flex items-center justify-between gap-4 print:hidden">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-light-100 hover:text-white transition-colors w-fit group"
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Analyze another resume
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
                    >
                        <Download className="size-3.5" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Hero Score Section */}
            <div className={cn("card p-8 flex flex-col md:flex-row items-center gap-8 border transition-all duration-500", getScoreBg(analysis.atsScore))}>
                <div className="relative size-40 shrink-0">
                    <svg className="size-full" viewBox="0 0 100 100">
                        <circle
                            className="text-black/5 dark:text-dark-300 stroke-current transition-colors duration-500"
                            strokeWidth="10"
                            fill="transparent"
                            r="40" cx="50" cy="50"
                        />
                        <circle
                            className={cn("stroke-current transition-all duration-1000 ease-out", getScoreColor(analysis.atsScore))}
                            strokeWidth="10"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * analysis.atsScore) / 100}
                            strokeLinecap="round"
                            fill="transparent"
                            r="40" cx="50" cy="50"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn("text-4xl font-bold", getScoreColor(analysis.atsScore))}>{analysis.atsScore}</span>
                        <span className="text-xs text-light-600 dark:text-light-100 font-medium">ATS SCORE</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold text-dark-100 dark:text-white elite-text-gradient underline decoration-primary-200/30 underline-offset-8">Analysis Summary</h2>
                        <span className="px-2 py-0.5 rounded bg-primary-200/20 border border-primary-200/30 text-primary-200 text-[10px] font-black uppercase tracking-widest animate-pulse">Elite</span>
                    </div>
                    <p className="text-light-800 dark:text-light-100 text-lg leading-relaxed">
                        {analysis.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-6 mt-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-light-600 dark:text-light-100/50 font-bold uppercase tracking-widest">Industry Standing</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-success-100">{analysis.benchmarking.standing}</span>
                                <span className="text-xs text-light-600 dark:text-light-100/80">({analysis.benchmarking.percentile}th percentile)</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-light-600 dark:text-light-100/50 font-bold uppercase tracking-widest">Top Advantage</span>
                            <span className="text-sm font-medium text-dark-100 dark:text-white italic">"{analysis.benchmarking.comparisonPoints[0]}"</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Elite Cover Letter Section - High-Profile Call to Action */}
            {analysis.jdMatch ? (
                <div className="card p-8 border-primary-200/20 bg-primary-200/5 flex flex-col md:flex-row items-center justify-between gap-8 elite-glow relative overflow-hidden group/cl">
                    <div className="absolute top-0 right-0 size-48 bg-primary-200/5 blur-3xl -mr-24 -mt-24 rounded-full group-hover/cl:bg-primary-200/10 transition-colors duration-700" />
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="size-14 rounded-2xl bg-primary-200/10 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                            <Quote className="text-primary-200 size-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3 justify-center md:justify-start elite-text-gradient italic">
                                AI Cover Letter Generator
                                <span className="text-[10px] px-2 py-0.5 rounded bg-primary-200/20 text-primary-200 uppercase tracking-tighter border border-primary-200/30 font-black not-italic animate-pulse">Elite Feature</span>
                            </h3>
                            <p className="text-sm text-light-100 italic max-w-lg leading-relaxed">
                                We've analyzed the JD requirements. Generate a perfectly tailored cover letter that highlights your specific achievements for this role.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            if (coverLetter) {
                                setShowCLModal(true);
                                return;
                            }
                            setIsGeneratingCL(true);
                            try {
                                const result = await generateCoverLetter(analysis.summary, analysis.jdMatch?.recommendation || "");
                                if (result.success && result.coverLetter) {
                                    setCoverLetter(result.coverLetter);
                                    setShowCLModal(true);
                                } else {
                                    toast.error(result.error || "Failed to generate cover letter");
                                }
                            } catch (e) {
                                toast.error("An error occurred");
                            } finally {
                                setIsGeneratingCL(false);
                            }
                        }}
                        disabled={isGeneratingCL}
                        className="btn-primary py-4 px-10 text-sm font-bold flex items-center gap-3 shadow-2xl shadow-primary-200/30 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap w-full md:w-auto"
                    >
                        {isGeneratingCL ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                        {coverLetter ? "View Your Letter" : "Generate Now"}
                    </button>
                </div>
            ) : (
                <div className="card p-6 border-white/5 bg-white/5 border-dashed flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity animate-fadeIn print:hidden">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                            <Sparkles className="text-light-100/30 size-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-light-100/50 mb-1">Tailored Cover Letter Generator (Locked)</h3>
                            <p className="text-sm text-light-100/40 italic max-w-lg leading-relaxed">
                                Upload a Job Description during the analysis phase to unlock your personalized Elite Cover Letter generator.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onReset}
                        className="btn-secondary py-3 px-8 text-xs font-bold flex items-center gap-2 hover:bg-white/10"
                    >
                        <ArrowLeft className="size-3.5" />
                        Re-analyze with JD
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Keywords section */}
                <div className="card p-6 border border-black/5 dark:border-white/5 bg-white/50 dark:bg-transparent">
                    <div className="flex items-center gap-3 mb-6">
                        <Search className="text-primary-200" />
                        <h3 className="text-xl font-semibold text-dark-100 dark:text-white">Missing Keywords</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((keyword, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-destructive-100/10 border border-destructive-100/20 text-destructive-100 text-sm font-medium">
                                + {keyword}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-light-600 dark:text-light-100 mt-4 leading-relaxed italic">
                        Adding these keywords naturally into your experience section will significantly increase your visibility in ATS filters.
                    </p>
                </div>

                {/* Impact section */}
                <div className="card p-6 border border-black/5 dark:border-white/5 bg-white/50 dark:bg-transparent">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="text-success-100" />
                        <h3 className="text-xl font-semibold text-dark-100 dark:text-white">Quantifiable Achievements</h3>
                    </div>
                    <ul className="flex flex-col gap-3">
                        {analysis.quantifiableAchievements && analysis.quantifiableAchievements.length > 0 ? (
                            analysis.quantifiableAchievements.map((item, i) => (
                                <li key={i} className="flex gap-2 text-sm text-light-800 dark:text-light-100 text-pretty">
                                    <span className="text-success-100 font-bold">•</span>
                                    {item}
                                </li>
                            ))
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-xs text-light-600 dark:text-light-100/60 italic px-2">No quantifiable achievements detected. Try adding impact metrics like:</p>
                                {[
                                    "Increased department efficiency by 25% through...",
                                    "Led a team of 10 to deliver X project 2 weeks ahead of schedule.",
                                    "Reduced server costs by $2,000/month by optimizing..."
                                ].map((placeholder, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-light-400 dark:text-light-100/40 italic">
                                        <span className="text-success-100/30 font-bold">•</span>
                                        {placeholder}
                                    </li>
                                ))}
                            </div>
                        )}
                    </ul>
                </div>
            </div>

            {/* Pro Radar & JD Match Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 card p-6 border border-black/5 dark:border-white/5 bg-white/80 dark:bg-dark-200/50 transition-colors duration-500">
                    <h3 className="text-center text-lg font-bold mb-4 text-dark-100 dark:text-white">Skills Analysis</h3>
                    <RadarChart />
                </div>

                <div className="lg:col-span-2 card p-8 border border-black/5 dark:border-white/5 bg-white/80 dark:bg-transparent flex flex-col justify-center transition-colors duration-500">
                    {analysis.jdMatch ? (
                        <div className="animate-fadeIn">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-dark-100 dark:text-white flex items-center gap-3">
                                    <Target className="text-primary-200" />
                                    Job Description Match
                                </h3>
                                <div className="px-4 py-2 rounded-lg bg-primary-200/10 border border-primary-200/20">
                                    <span className="text-2xl font-black text-primary-200">{analysis.jdMatch.percentage}%</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-semibold text-light-800 dark:text-light-100 mb-2">Key Recommendation:</p>
                                    <p className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-primary-600 dark:text-primary-100 italic text-sm">
                                        &ldquo;{analysis.jdMatch.recommendation}&rdquo;
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-destructive-100 uppercase tracking-wider">Missing Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysis.jdMatch.missingSkills.map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-md bg-destructive-100/10 text-destructive-100 text-[10px] border border-destructive-100/10">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-primary-200 uppercase tracking-wider">Keyword Gaps</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysis.jdMatch.missingKeywords.map((k, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-md bg-primary-200/10 text-primary-200 text-[10px] border border-primary-200/10">{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-black/5 dark:border-white/5 rounded-2xl opacity-50 transition-all">
                            <AlertCircle className="size-12 text-light-400 dark:text-light-100 mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-dark-100 dark:text-white">No Job Description Provided</h3>
                            <p className="text-sm text-light-600 dark:text-light-100 max-w-xs">Provide a Job Description during upload to see real-time match scores and tailored skill gap analysis.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gap Filler (AI Learning Path) */}
            <div className="card p-8 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-dark-200/30 transition-colors duration-500">
                <div className="flex items-center gap-3 mb-8">
                    <GraduationCap className="text-primary-200 size-6" />
                    <div>
                        <h3 className="text-2xl font-bold text-dark-100 dark:text-white">The Gap Filler™</h3>
                        <p className="text-xs text-light-600 dark:text-light-100">AI-generated 3-step roadmap to bridge your profile gaps.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-light-600 dark:text-light-100 text-[10px] font-bold uppercase tracking-widest ml-auto">Elite</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {analysis.learningPath.map((gap, i) => (
                        <div key={i} className="flex flex-col p-6 rounded-2xl bg-black/5 dark:bg-dark-300/50 border border-black/5 dark:border-white/5 relative overflow-hidden group hover:border-primary-200/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BookOpen className="size-12 text-primary-200" />
                            </div>
                            <h4 className="text-lg font-bold text-dark-100 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-primary-200" />
                                {gap.skill}
                            </h4>
                            <div className="space-y-4 mb-6">
                                {gap.roadmap.map((step, si) => (
                                    <div key={si} className="flex gap-3 text-xs text-light-800 dark:text-light-100 items-start">
                                        <span className="size-5 rounded-full bg-primary-200/10 flex items-center justify-center text-[10px] font-bold text-primary-200 shrink-0">{si + 1}</span>
                                        <p className="leading-tight">{step}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                                <p className="text-[10px] font-bold text-primary-600 dark:text-primary-100 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Target className="size-3" />
                                    Project Idea
                                </p>
                                <p className="text-xs text-dark-100 dark:text-white font-medium italic">&ldquo;{gap.projectIdea}&rdquo;</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Bullet Point Optimizer */}
            <div className="card p-8 border border-primary-200/20 bg-primary-200/5 transition-colors duration-500">
                <div className="flex items-center gap-3 mb-8">
                    <Loader2 className="text-primary-200 size-6" />
                    <h3 className="text-2xl font-bold text-dark-100 dark:text-white">AI Bullet Optimizer</h3>
                    <span className="px-2 py-0.5 rounded bg-primary-200 text-dark-100 text-[10px] font-black uppercase tracking-tighter ml-auto">Elite</span>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {analysis.optimizedBullets.map((bullet, i) => (
                        <div key={i} className="group flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-light-600 dark:text-light-100/50 uppercase tracking-widest px-2">Original</p>
                                    <div className="p-4 rounded-xl bg-black/5 dark:bg-dark-300 border border-black/5 dark:border-white/5 text-sm text-light-600 dark:text-light-100 line-through decoration-destructive-100/30">
                                        {bullet.original}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-primary-600 dark:text-primary-200 uppercase tracking-widest px-2">AI Optimized</p>
                                    <div className="p-4 rounded-xl bg-primary-200/10 border border-primary-200/30 text-sm text-dark-100 dark:text-white font-medium ring-1 ring-primary-200/20 group-hover:ring-primary-200/50 transition-all">
                                        {bullet.optimized}
                                    </div>
                                </div>
                            </div>
                            <div className="px-2 flex items-start gap-2 text-xs text-primary-600 dark:text-primary-100 italic">
                                <span>💡</span>
                                <p>{bullet.reason}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sections breakdown */}
            <div className="card p-8 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-transparent transition-colors duration-500">
                <div className="flex items-center gap-3 mb-8">
                    <Layout className="text-primary-200" />
                    <h3 className="text-2xl font-bold text-dark-100 dark:text-white">Section Breakdown</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {analysis.sections.map((section, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-dark-100 dark:text-white">{section.name}</span>
                                <span className={cn("font-bold", getScoreColor(section.score))}>{section.score}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/5 dark:bg-dark-300 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-700", getScoreColor(section.score).replace('text', 'bg'))}
                                    style={{ width: `${section.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-light-600 dark:text-light-100 italic">{section.feedback}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="card p-6 border border-black/5 dark:border-white/5 bg-success-100/5 transition-colors duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 className="text-success-100" />
                        <h3 className="text-xl font-semibold text-success-100">Key Strengths</h3>
                    </div>
                    <ul className="flex flex-col gap-3">
                        {analysis.strengths.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-light-800 dark:text-light-100">
                                <CheckCircle2 className="size-4 shrink-0 text-success-100/60 mt-0.5" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="card p-6 border border-black/5 dark:border-white/5 bg-destructive-100/5 transition-colors duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <XCircle className="text-destructive-100" />
                        <h3 className="text-xl font-semibold text-destructive-100">Critical Weaknesses</h3>
                    </div>
                    <ul className="flex flex-col gap-3">
                        {analysis.weaknesses.map((w, i) => (
                            <li key={i} className="flex gap-2 text-sm text-light-800 dark:text-light-100">
                                <AlertCircle className="size-4 shrink-0 text-destructive-100/60 mt-0.5" />
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Formatting feedback */}
            <div className="card p-6 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-dark-200/50 transition-colors duration-500">
                <div className="flex items-center gap-3 mb-4">
                    <ListChecks className="text-primary-600 dark:text-primary-100" />
                    <h3 className="text-xl font-semibold text-dark-100 dark:text-white">Recruiter&apos;s Feedback</h3>
                </div>
                <p className="text-light-800 dark:text-light-100 leading-relaxed italic text-sm">
                    &ldquo;{analysis.formattingFeedback}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-success-100 size-4" />
                        <span className="text-xs text-light-600 dark:text-light-100 font-medium tracking-wide uppercase">Recruiter Confidence</span>
                    </div>
                    <span className="text-sm font-black text-dark-100 dark:text-white uppercase">{analysis.atsScore > 75 ? 'HIGH' : analysis.atsScore > 50 ? 'MEDIUM' : 'LOW'}</span>
                </div>
            </div>

            <button
                onClick={onReset}
                className="btn-secondary w-full py-4 text-lg"
            >
                Analyze Another Resume
            </button>

            {/* Cover Letter Modal */}
            {showCLModal && coverLetter && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 dark:bg-dark-100/80 backdrop-blur-md animate-fadeIn"
                    onClick={() => setShowCLModal(false)}
                >
                    <div
                        className="card max-w-2xl w-full bg-white dark:bg-dark-200 border-black/10 dark:border-primary-200/20 shadow-2xl overflow-hidden flex flex-col transition-colors duration-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-primary-200/5">
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-primary-200 size-5" />
                                <h3 className="text-xl font-bold text-dark-100 dark:text-white">Elite Tailored Cover Letter</h3>
                            </div>
                            <button onClick={() => setShowCLModal(false)} className="text-light-600 dark:text-light-100 hover:text-dark-100 dark:hover:text-white transition-colors">
                                <XCircle className="size-6" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[70vh] text-light-800 dark:text-light-100 leading-relaxed font-serif whitespace-pre-wrap text-sm">
                            {coverLetter}
                        </div>
                        <div className="p-6 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-dark-300/50 flex items-center justify-between gap-4">
                            <p className="text-[10px] text-light-600 dark:text-light-100/50 italic flex-1">
                                This letter has been optimized for the specific JD and your top-tier achievements.
                            </p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(coverLetter);
                                    toast.success("Cover letter copied to clipboard!");
                                }}
                                className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                            >
                                <ListChecks className="size-4" />
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeAnalysisResult;
