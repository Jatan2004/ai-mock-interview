"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Paperclip, Type, X, Search, Sparkles } from "lucide-react";
import { analyzeResume } from "@/lib/actions/resume.action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
    onAnalysisComplete: (analysis: any) => void;
}

const ResumeUpload = ({ onAnalysisComplete }: ResumeUploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [jdText, setJdText] = useState("");
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [jdInputType, setJdInputType] = useState<"text" | "file">("text");
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else {
            toast.error("Please upload a valid PDF file");
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragover") setIsDragging(true);
        else setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type === "application/pdf") {
            setFile(droppedFile);
        } else {
            toast.error("Please upload a valid PDF file");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setProgress(10);

        const formData = new FormData();
        formData.append("resume", file);
        if (jdInputType === "text" && jdText.trim()) {
            formData.append("jd", jdText);
        } else if (jdInputType === "file" && jdFile) {
            formData.append("jdFile", jdFile);
        }

        try {
            setProgress(30);
            const result = await analyzeResume(formData);
            setProgress(90);

            if (result.success) {
                toast.success("Resume analyzed successfully!");
                onAnalysisComplete(result.analysis);
            } else {
                toast.error(result.error || "Analysis failed");
            }
        } catch (error: any) {
            console.error("Client: Resume analysis error:", error);
            toast.error(error.message || "Something went wrong during analysis");
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-fadeIn text-left">
            {/* Main Upload Area Wrapper for behind-the-box glow */}
            <div className="relative">

                <div
                    className={cn(
                        "glass-panel p-12 border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center relative overflow-hidden group/upload",
                        file ? "border-primary-200 bg-primary-200/5 shadow-sm" : "border-black/10 dark:border-white/10 hover:animate-border-glow hover:bg-primary-200/[0.02]",
                        isDragging && "scale-[1.02] animate-border-glow bg-primary-200/10"
                    )}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                >

                    {!file ? (
                        <label className="flex flex-col items-center gap-6 cursor-pointer w-full group relative z-10">
                            <div className="size-20 rounded-2xl bg-primary-200/10 flex items-center justify-center mb-2 border border-primary-200/20 group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:shadow-primary-200/20">
                                <Upload className="text-primary-200 size-8 group-hover:animate-bounce-slow" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold elite-text-gradient">Upload your Resume</h3>
                                <p className="text-sm text-light-600 dark:text-light-100/60 font-medium">
                                    Drag and drop your PDF here, or <span className="text-primary-200 underline underline-offset-4 decoration-primary-200/30">click to browse</span>
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={onFileChange}
                            />
                        </label>
                    ) : (
                        <div className="flex flex-col items-center gap-6 w-full animate-fadeIn">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-full max-w-md">
                                <FileText className="text-primary-200 size-8 shrink-0" />
                                <div className="flex-1 overflow-hidden text-left">
                                    <p className="font-semibold text-dark-100 dark:text-white truncate">{file.name}</p>
                                    <p className="text-xs text-light-600 dark:text-light-100/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="p-2 hover:bg-destructive-100/10 text-light-600 dark:text-light-100 hover:text-destructive-100 transition-colors"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            {isUploading ? (
                                <div className="w-full max-w-md flex flex-col items-center gap-4">
                                    <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-200 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-200 text-sm font-medium">
                                        <Loader2 className="animate-spin size-4" />
                                        <span>Analyzing Resume...</span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleUpload}
                                    className="btn-primary px-8 py-3 text-base flex items-center gap-2"
                                >
                                    <Sparkles className="size-5" />
                                    Analyze Resume
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Job Description Area */}
            <div className="card p-6 border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Search className="text-primary-200 size-5" />
                        <h3 className="text-lg font-semibold text-dark-100 dark:text-white">Target Job Description (Optional)</h3>
                    </div>
                    <div className="flex items-center bg-black/5 dark:bg-dark-300/50 rounded-lg p-1">
                        <button
                            onClick={() => setJdInputType("text")}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                jdInputType === "text" ? "bg-primary-200 text-dark-100 shadow-sm" : "text-light-600 dark:text-light-100/50 hover:text-dark-100 dark:hover:text-white"
                            )}
                        >
                            Text
                        </button>
                        <button
                            onClick={() => setJdInputType("file")}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                jdInputType === "file" ? "bg-primary-200 text-dark-100 shadow-sm" : "text-light-600 dark:text-light-100/50 hover:text-dark-100 dark:hover:text-white"
                            )}
                        >
                            PDF
                        </button>
                    </div>
                </div>

                {jdInputType === "text" ? (
                    <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                        }}
                        rows={1}
                        placeholder="Paste the job description here to get a tailored analysis..."
                        className="w-full min-h-[44px] bg-black/[0.02] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm text-dark-100 dark:text-light-100 placeholder:text-light-600 dark:placeholder:text-light-100/30 focus:outline-none focus:border-primary-200/50 transition-all resize-none overflow-hidden"
                    />
                ) : (
                    <div className="min-h-[120px] flex items-center justify-center p-4 border-2 border-dashed border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-transparent">
                        {!jdFile ? (
                            <label className="flex flex-col items-center gap-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                                <Paperclip className="size-6 text-primary-200" />
                                <span className="text-sm text-light-600 dark:text-light-100">Upload JD PDF</span>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const selected = e.target.files?.[0];
                                        if (selected?.type === "application/pdf") setJdFile(selected);
                                        else toast.error("Please upload a PDF");
                                    }}
                                />
                            </label>
                        ) : (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                                <FileText className="size-5 text-primary-200" />
                                <span className="text-sm font-medium text-dark-100 dark:text-white truncate max-w-[200px]">{jdFile.name}</span>
                                <button
                                    onClick={() => setJdFile(null)}
                                    className="text-light-600 dark:text-light-100 hover:text-destructive-100 transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeUpload;
