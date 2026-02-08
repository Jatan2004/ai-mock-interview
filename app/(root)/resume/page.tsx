"use client";

import { useState } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeAnalysisResult from "@/components/ResumeAnalysisResult";
import { Gauge, Search, Target, Sparkles, ShieldCheck, Zap } from "lucide-react";

const ResumePage = () => {
    const [analysis, setAnalysis] = useState<any>(null);

    const handleAnalysisComplete = (data: any) => {
        setAnalysis(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleReset = () => {
        setAnalysis(null);
    };

    return (
        <div className="relative min-h-screen">
            <div className="flex flex-col gap-10 relative z-10 py-10">
                {!analysis && (
                    <section className="flex flex-col gap-6 animate-fadeIn relative">
                        {/* Decorative background glow */}
                        <div className="absolute -top-20 -left-20 size-64 bg-primary-200/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="flex flex-col gap-4 text-center md:text-left relative z-10">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <div className="size-8 rounded-lg bg-primary-200/10 flex items-center justify-center border border-primary-200/20">
                                    <Sparkles className="text-primary-200 size-4" />
                                </div>
                                <span className="text-[10px] font-black tracking-[0.4em] text-primary-200 uppercase">AI-Powered Optimization</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-dark-100 dark:text-white leading-[1] tracking-tighter">
                                Resume <span className="elite-text-gradient italic pr-4">Analyzer</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-light-600 dark:text-light-100/70 max-w-3xl leading-relaxed font-medium">
                                Engineered for high-stakes ATS success. Decode recruiter algorithms, bridge skill gaps, and position yourself as the <span className="text-primary-200 underline underline-offset-8 decoration-primary-200/30">perfect candidate</span>.
                            </p>
                        </div>
                    </section>
                )}

                {!analysis ? (
                    <section className="flex flex-col items-center justify-center py-6 gap-20 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                        <div className="w-full relative px-4 md:px-0">
                            <div className="absolute inset-0 bg-primary-200/5 blur-[120px] rounded-full pointer-events-none" />
                            <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-4 md:px-0">
                            {/* Feature Card 1 */}
                            <div className="card p-10 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 elite-glow border-t-primary-200/20">
                                <div className="size-14 rounded-2xl bg-primary-200/10 flex items-center justify-center mb-8 border border-primary-200/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    <Gauge className="text-primary-200 size-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-dark-100 dark:text-white elite-text-gradient">ATS Scoring</h3>
                                <p className="text-base text-light-600 dark:text-light-100/70 leading-relaxed font-medium">
                                    Real-time evaluation against the exact algorithms used by Fortune 500 recruiters to filter top-tier talent.
                                </p>
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-primary-200 tracking-[0.2em] uppercase">
                                    <ShieldCheck className="size-4 animate-pulse" />
                                    Recruiter-Verified
                                </div>
                            </div>

                            {/* Feature Card 2 */}
                            <div className="card p-10 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 elite-glow border-t-primary-200/20">
                                <div className="size-14 rounded-2xl bg-primary-200/10 flex items-center justify-center mb-8 border border-primary-200/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                                    <Search className="text-primary-200 size-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-dark-100 dark:text-white elite-text-gradient">Context Mapping</h3>
                                <p className="text-base text-light-600 dark:text-light-100/70 leading-relaxed font-medium">
                                    Our advanced AI maps your unique experiences against job descriptions to identify critical keyword gaps.
                                </p>
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-primary-200 tracking-[0.2em] uppercase">
                                    <Zap className="size-4 animate-pulse" />
                                    Context-Aware
                                </div>
                            </div>

                            {/* Feature Card 3 */}
                            <div className="card p-10 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 elite-glow border-t-success-100/20">
                                <div className="size-14 rounded-2xl bg-success-100/10 flex items-center justify-center mb-8 border border-success-100/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    <Target className="text-success-100 size-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-dark-100 dark:text-white elite-text-gradient">Impact Optimization</h3>
                                <p className="text-base text-light-600 dark:text-light-100/70 leading-relaxed font-medium">
                                    Transform passive narratives into high-impact achievements using quantitative AI optimization.
                                </p>
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-success-100 tracking-[0.2em] uppercase">
                                    <Sparkles className="size-4 animate-pulse" />
                                    AI-Optimized
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="py-2 animate-fadeIn relative z-20">
                        <ResumeAnalysisResult analysis={analysis} onReset={handleReset} />
                    </section>
                )}
            </div>
        </div>
    );
};

export default ResumePage;
