"use client";

import { useState } from "react";
import Image from "next/image";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeAnalysisResult from "@/components/ResumeAnalysisResult";
import { Gauge, Search, Target } from "lucide-react";

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
        <div className="flex flex-col gap-10">
            {!analysis && (
                <>
                    {/* Hero — matches card-cta style from mock interview home page */}
                    <section className="card-cta animate-fadeIn">
                        <div className="flex flex-col gap-7 max-w-lg">
                            <h2 className="text-4xl md:text-5xl leading-tight">
                                Analyze your resume with AI-powered insights
                            </h2>
                            <p className="text-lg">
                                Decode ATS algorithms, surface keyword gaps, and position yourself as the perfect candidate — in seconds.
                            </p>
                        </div>

                        <Image
                            src="/robot.png"
                            alt="AI resume analysis"
                            width={350}
                            height={350}
                            className="max-sm:hidden object-contain"
                        />
                    </section>

                    {/* Upload area */}
                    <section className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
                        <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
                    </section>

                    {/* Feature cards — matches "How it works" section on home page */}
                    <section className="flex flex-col gap-4 animate-fadeIn" style={{ animationDelay: "200ms" }}>
                        <h2>What we analyze</h2>
                        <p className="text-sm text-muted-foreground">Three pillars of a standout resume.</p>

                        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                            {/* Card 1 */}
                            <div className="card p-6 min-h-40 card-hover">
                                <div className="flex items-center gap-3 mb-2">
                                    <Gauge className="text-primary-200 size-6" />
                                    <h3 className="text-primary dark:text-primary-100">ATS Scoring</h3>
                                </div>
                                <p>Real-time evaluation against the algorithms used by Fortune 500 recruiters to filter top-tier talent.</p>
                            </div>

                            {/* Card 2 */}
                            <div className="card p-6 min-h-40 card-hover">
                                <div className="flex items-center gap-3 mb-2">
                                    <Search className="text-primary-200 size-6" />
                                    <h3 className="text-primary dark:text-primary-100">Context Mapping</h3>
                                </div>
                                <p>Advanced AI maps your experience against job descriptions to identify critical keyword gaps.</p>
                            </div>

                            {/* Card 3 */}
                            <div className="card p-6 min-h-40 card-hover">
                                <div className="flex items-center gap-3 mb-2">
                                    <Target className="text-success-100 size-6" />
                                    <h3 className="text-primary dark:text-primary-100">Impact Optimization</h3>
                                </div>
                                <p>Transform passive narratives into high-impact achievements using quantitative AI optimization.</p>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {analysis && (
                <section className="py-2 animate-fadeIn">
                    <ResumeAnalysisResult analysis={analysis} onReset={handleReset} />
                </section>
            )}
        </div>
    );
};

export default ResumePage;
