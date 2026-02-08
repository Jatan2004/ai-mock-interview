"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from "./LogoutButton";
import { cn } from "@/lib/utils";
import { Sparkles, FileText, Zap, Menu, X } from "lucide-react";

const Navbar = () => {
    const pathname = usePathname();
    const isResumePage = pathname?.includes("/resume");

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 transition-colors duration-500">
            {/* Desktop Background & Blur */}
            <div className="absolute inset-0 backdrop-blur-xl bg-white/70 dark:bg-dark-100/50 border-b border-black/5 dark:border-white/5 shadow-2xl transition-colors duration-500 -z-10" />

            <div className="flex items-center justify-between py-4 px-6 md:px-12 relative z-20">
                <Link href="/" className="flex items-center gap-3 group transition-all shrink-0">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-primary-200/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image
                            src="/logo.svg"
                            alt="MockMate Logo"
                            width={38}
                            height={32}
                            className="logo-theme group-hover:scale-110 transition-transform relative z-10"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h2 className={cn(
                            "text-lg font-black tracking-tight leading-none uppercase transition-all duration-500",
                            isResumePage
                                ? "text-dark-300 dark:text-white drop-shadow-[0_0_10px_rgba(202,197,254,0.4)]"
                                : "text-dark-300 dark:text-white group-hover:text-primary-200 drop-shadow-[0_0_8px_rgba(202,197,254,0.2)]"
                        )}>
                            {isResumePage ? "Resume Analyzer" : "AI Interviews"}
                        </h2>
                        <p className="text-[8px] font-bold text-light-600 dark:text-light-100/30 uppercase tracking-[0.2em] mt-1">
                            {isResumePage ? "Elite ATS Intelligence" : "Next-Gen Preparation"}
                        </p>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className={cn(
                                "relative px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden group/nav border",
                                !isResumePage
                                    ? "bg-primary-200/10 border-primary-200/40 text-primary-200 shadow-[0_0_20px_rgba(202,197,254,0.15)]"
                                    : "text-white/70 hover:text-white border-white/10 dark:border-white/10 hover:border-primary-200/40 bg-white/[0.03] dark:bg-white/[0.03] hover:bg-white/[0.08] dark:hover:bg-white/[0.08]"
                            )}
                        >
                            <div className="flex items-center gap-2 relative z-10 transition-transform duration-300 group-hover/nav:translate-x-0.5">
                                <Zap className={cn("size-3.5", !isResumePage ? "text-primary-200" : "text-white/50 group-hover/nav:text-primary-200")} />
                                <span>Mock Interviews</span>
                            </div>
                            {!isResumePage && (
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 dark:to-white/10 opacity-30 animate-shine" />
                            )}
                        </Link>

                        <Link
                            href="/resume"
                            className={cn(
                                "relative px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden group/nav border",
                                isResumePage
                                    ? "bg-primary-200/10 border-primary-200/40 text-primary-200 shadow-[0_0_20px_rgba(202,197,254,0.15)]"
                                    : "text-white/70 hover:text-white border-white/10 dark:border-white/10 hover:border-primary-200/40 bg-white/[0.03] dark:bg-white/[0.03] hover:bg-white/[0.08] dark:hover:bg-white/[0.08]"
                            )}
                        >
                            <div className="flex items-center gap-2 relative z-10 transition-transform duration-300 group-hover/nav:translate-x-0.5">
                                <FileText className={cn("size-3.5", isResumePage ? "text-primary-200" : "text-white/70 group-hover/nav:text-primary-200")} />
                                <span>Resume Analyzer</span>
                            </div>
                            {isResumePage && (
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 dark:to-white/10 opacity-30 animate-shine" />
                            )}
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-black/10 dark:border-white/10">
                        <div className="hover:scale-110 transition-transform">
                            <ThemeToggle />
                        </div>
                        <div className="hover:scale-110 transition-transform">
                            <LogoutButton />
                        </div>
                    </div>
                </div>

                {/* Mobile Actions & Toggle */}
                <div className="flex md:hidden items-center gap-4 relative z-50">
                    <div className="hover:scale-110 transition-transform">
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-dark-300 dark:text-white"
                    >
                        <Menu className="size-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-white dark:bg-black z-[999] flex flex-col animate-fadeIn md:hidden">
                    <div className="flex items-center justify-between p-6 px-8 w-full border-b border-black/5 dark:border-white/5">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                            <Image
                                src="/logo.svg"
                                alt="MockMate Logo"
                                width={32}
                                height={28}
                                className="logo-theme"
                            />
                            <span className="text-lg font-black uppercase tracking-tight text-dark-300 dark:text-white">
                                {isResumePage ? "Resume Analyzer" : "AI Interviews"}
                            </span>
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-dark-300 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="size-6" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 gap-8 w-full p-8 overflow-y-auto">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "relative px-8 py-5 rounded-full text-base font-black uppercase tracking-widest transition-all overflow-hidden group/nav border w-full max-w-sm text-center",
                                !isResumePage
                                    ? "bg-primary-200/10 border-primary-200/40 text-primary-200 shadow-[0_0_30px_rgba(202,197,254,0.2)]"
                                    : "text-dark-300/70 dark:text-white/70 border-black/10 dark:border-white/10 active:scale-95 bg-black/[0.02] dark:bg-white/[0.02]"
                            )}
                        >
                            <div className="flex items-center justify-center gap-3 relative z-10">
                                <Zap className={cn("size-6", !isResumePage ? "text-primary-200" : "text-dark-300/50 dark:text-white/50")} />
                                <span>Mock Interviews</span>
                            </div>
                        </Link>

                        <Link
                            href="/resume"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "relative px-8 py-5 rounded-full text-base font-black uppercase tracking-widest transition-all overflow-hidden group/nav border w-full max-w-sm text-center",
                                isResumePage
                                    ? "bg-primary-200/10 border-primary-200/40 text-primary-200 shadow-[0_0_30px_rgba(202,197,254,0.2)]"
                                    : "text-dark-300/70 dark:text-white/70 border-black/10 dark:border-white/10 active:scale-95 bg-black/[0.02] dark:bg-white/[0.02]"
                            )}
                        >
                            <div className="flex items-center justify-center gap-3 relative z-10">
                                <FileText className={cn("size-6", isResumePage ? "text-primary-200" : "text-dark-300/70 dark:text-white/70")} />
                                <span>Resume Analyzer</span>
                            </div>
                        </Link>

                        <div className="mt-8 scale-110 w-full flex justify-center">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
